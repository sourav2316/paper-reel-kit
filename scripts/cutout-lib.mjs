// Local, free background removal + cleanup + scoring for photo cutouts.
import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";

/**
 * Remove the background and keep only the main subject.
 * Returns { png, score, info } — png is a trimmed, graded, transparent PNG buffer.
 * opts.allowCut: sides where the subject MAY touch the frame (e.g. ["bottom"] for hands/arms coming from below)
 */
export async function cutout(input, opts = {}) {
  const allowCut = new Set(opts.allowCut ?? []);
  // normalise input size for speed + quality
  const src = await sharp(input).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 95 }).toBuffer();
  const blob = await removeBackground(new Blob([src], { type: "image/jpeg" }), { model: opts.model ?? "medium", output: { format: "image/png", quality: 1 } });
  const raw = Buffer.from(await blob.arrayBuffer());
  const { data, info } = await sharp(raw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  // --- connected components on a small mask
  const S = 256, sw = Math.round((W / Math.max(W, H)) * S), sh = Math.round((H / Math.max(W, H)) * S);
  const small = await sharp(raw).ensureAlpha().extractChannel(3).resize(sw, sh).raw().toBuffer();
  const mask = new Uint8Array(sw * sh); for (let i = 0; i < mask.length; i++) mask[i] = small[i] > 128 ? 1 : 0;
  const label = new Int32Array(sw * sh).fill(-1); const comps = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i] >= 0) continue;
    const id = comps.length; let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const st = [i]; label[i] = id;
    while (st.length) {
      const p = st.pop(); n++; const x = p % sw, y = (p / sw) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const q of [p - 1, p + 1, p - sw, p + sw]) {
        if (q < 0 || q >= mask.length || label[q] >= 0 || !mask[q]) continue;
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === sw - 1)) continue;
        label[q] = id; st.push(q);
      }
    }
    comps.push({ id, n, x0, y0, x1, y1 });
  }
  const totalFg = comps.reduce((a, c) => a + c.n, 0);
  if (!comps.length) return { png: null, score: 0, info: "empty mask" };
  comps.sort((a, b) => b.n - a.n);
  const main = comps[0];
  // keep main + big pieces that sit inside/next to its box (e.g. a detached wheel, a hand's fingers)
  const pad = Math.round(S * 0.03);
  const keep = new Set(comps.filter((c) => c === main || (c.n > main.n * 0.04 && c.x0 >= main.x0 - pad && c.x1 <= main.x1 + pad && c.y0 >= main.y0 - pad && c.y1 <= main.y1 + pad)).map((c) => c.id));
  const keepN = comps.filter((c) => keep.has(c.id)).reduce((a, c) => a + c.n, 0);

  // edge touching of kept subject (per side)
  const side = { left: 0, right: 0, top: 0, bottom: 0 };
  for (let y = 0; y < sh; y++) { if (keep.has(label[y * sw])) side.left++; if (keep.has(label[y * sw + sw - 1])) side.right++; }
  for (let x = 0; x < sw; x++) { if (keep.has(label[x])) side.top++; if (keep.has(label[(sh - 1) * sw + x])) side.bottom++; }
  let edgePenalty = 0;
  for (const k of Object.keys(side)) { const frac = side[k] / (k === "left" || k === "right" ? sh : sw); if (!allowCut.has(k)) edgePenalty += Math.min(1, frac * 4); }
  const coverage = keepN / (sw * sh);
  const purity = keepN / totalFg;               // 1 = only one subject in the photo
  const coverFit = coverage < 0.04 ? coverage / 0.04 : coverage > 0.75 ? Math.max(0, 1 - (coverage - 0.75) * 3) : 1;
  // messy fringe (grass, hair, smoke stuck to the subject) = many half-transparent pixels
  let soft = 0, solid = 0;
  for (let i = 3; i < data.length; i += 4) { const v = data[i]; if (v >= 235) solid++; else if (v > 20) soft++; }
  const mess = soft / (solid + 1);
  const messPen = Math.min(1, Math.max(0, (mess - 0.08) / 0.25));
  let score = purity * 0.35 + (1 - Math.min(1, edgePenalty)) * 0.35 + coverFit * 0.1 + (1 - messPen) * 0.2;
  if (coverage < 0.03) score *= 0.5; // subject is a speck in a big photo → low-res cutout

  // apply keep-mask at full res
  const fx = sw / W, fy = sh / H;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const l = label[Math.min(sh - 1, (y * fy) | 0) * sw + Math.min(sw - 1, (x * fx) | 0)];
    // only kill pixels that belong to a DISCARDED subject; soft edges of the kept subject stay intact
    if (l >= 0 && !keep.has(l)) data[(y * W + x) * 4 + 3] = 0;
  }
  // crop to subject bbox + 2% padding
  const bx0 = Math.max(0, Math.floor((main.x0 / sw) * W) - Math.round(W * 0.02)), by0 = Math.max(0, Math.floor((main.y0 / sh) * H) - Math.round(H * 0.02));
  let ux0 = bx0, uy0 = by0, ux1 = Math.min(W, Math.ceil(((main.x1 + 1) / sw) * W) + Math.round(W * 0.02)), uy1 = Math.min(H, Math.ceil(((main.y1 + 1) / sh) * H) + Math.round(H * 0.02));
  for (const c of comps) if (keep.has(c.id)) { ux0 = Math.min(ux0, Math.floor((c.x0 / sw) * W)); uy0 = Math.min(uy0, Math.floor((c.y0 / sh) * H)); ux1 = Math.max(ux1, Math.ceil(((c.x1 + 1) / sw) * W)); uy1 = Math.max(uy1, Math.ceil(((c.y1 + 1) / sh) * H)); }

  let img = sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract({ left: ux0, top: uy0, width: Math.max(1, ux1 - ux0), height: Math.max(1, uy1 - uy0) });
  const cropped = await img.png().toBuffer();
  const png = await grade(cropped, opts.grade ?? "vintage");
  return { png, score: +Math.max(0, score).toFixed(3), info: `purity ${purity.toFixed(2)} edge ${edgePenalty.toFixed(2)} cover ${coverage.toFixed(2)} mess ${mess.toFixed(2)}` };
}

/** Colour grade so photos from different sources match the muted paper look. Keeps alpha; softens alpha edge. */
export async function grade(png, mode = "vintage") {
  // Work on raw buffers: sharp's joinChannel silently drops alpha on some pipelines.
  const { data: a, info } = await sharp(png).ensureAlpha().extractChannel(3).blur(0.6).raw().toBuffer({ resolveWithObject: true });
  let rgbPipe = sharp(png).removeAlpha();
  if (mode === "vintage") {
    rgbPipe = rgbPipe.modulate({ saturation: 0.8 })
      .linear([0.93, 0.92, 0.86], [10, 8, 4])          // lift blacks, warm
      .recomb([[0.95, 0.05, 0.0], [0.03, 0.93, 0.04], [0.02, 0.06, 0.88]]);
  }
  const { data: rgb } = await rgbPipe.raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) { out[i * 4] = rgb[i * 3]; out[i * 4 + 1] = rgb[i * 3 + 1]; out[i * 4 + 2] = rgb[i * 3 + 2]; out[i * 4 + 3] = a[i]; }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
}

/** For opaque backgrounds: crop to 9:16 and grade. */
export async function prepBackground(input) {
  const buf = await sharp(input).rotate().resize(1080, 1920, { fit: "cover", position: "attention" })
    .modulate({ saturation: 0.75 }).linear([0.9, 0.9, 0.84], [16, 14, 8]).blur(0.4).png().toBuffer();
  return buf;
}

// FREE images: search stock photo libraries, cut out the subject locally, pick the cleanest one.
// Sources: Openverse (no key needed, CC licensed, includes Wikimedia/Flickr),
//          Pexels  (free key → PEXELS_API_KEY in .env, pexels.com/api),
//          Pixabay (free key → PIXABAY_API_KEY in .env, pixabay.com/api/docs) — these two give much cleaner product-style shots.
// Usage: npm run stock -- <name> [--only=assets/auto.png] [--candidates=5] [--force]
// Reads assets.json entries: { file, kind: "cutout"|"background", query: "auto rickshaw", allowCut?: ["bottom"], pick?: 2, url?: "direct image url", source?: "stock"|"ai"|"manual" }
// Writes the PNGs, assets/_candidates/<file>/NN_score.png for review, and CREDITS.md.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, projectName, projectDir, flag } from "./lib.mjs";
import { cutout, prepBackground } from "./cutout-lib.mjs";

const envFile = path.join(ROOT, ".env");
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const UA = { "User-Agent": "paper-reel-kit/1.0 (video asset tool)" };
const name = projectName();
const dir = projectDir(name);
const list = JSON.parse(fs.readFileSync(path.join(dir, "assets.json"), "utf8"));
const only = flag("only");
const force = process.argv.includes("--force");
const N = Number(flag("candidates", "5"));

async function searchPexels(q, orientation) {
  if (!process.env.PEXELS_API_KEY) return [];
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=15${orientation ? `&orientation=${orientation}` : ""}`;
  const r = await fetch(u, { headers: { Authorization: process.env.PEXELS_API_KEY } }); if (!r.ok) return [];
  const j = await r.json();
  return (j.photos ?? []).map((p) => ({ url: p.src.large2x ?? p.src.large, w: p.width, h: p.height, title: p.alt, credit: `Photo by ${p.photographer} on Pexels`, page: p.url, license: "Pexels License (free, no attribution required)", src: "pexels" }));
}
async function searchPixabay(q, orientation) {
  if (!process.env.PIXABAY_API_KEY) return [];
  const u = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&per_page=20&safesearch=true${orientation ? `&orientation=${orientation}` : ""}`;
  const r = await fetch(u); if (!r.ok) return [];
  const j = await r.json();
  return (j.hits ?? []).map((h) => ({ url: h.largeImageURL, w: h.imageWidth, h: h.imageHeight, title: h.tags, credit: `Image by ${h.user} on Pixabay`, page: h.pageURL, license: "Pixabay Content License (free, no attribution required)", src: "pixabay" }));
}
async function searchOpenverse(q) {
  // the API sometimes times out (504) on heavier filters → retry with a lighter filter
  for (const lic of ["license_type=commercial,modification", "license_type=commercial", "license_type=commercial"]) {
    const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&${lic}&page_size=20&mature=false`;
    const r = await fetch(u, { headers: UA }).catch(() => null);
    if (!r || !r.ok) { await new Promise((ok) => setTimeout(ok, 1500)); continue; }
    const j = await r.json();
    return (j.results ?? []).filter((x) => (x.width ?? 0) >= 700).map((x) => ({ url: x.url, w: x.width, h: x.height, title: `${x.title} ${(x.tags ?? []).filter((t) => !t.unstable__provider).map((t) => t.name).join(" ")}`,
      credit: `"${x.title}" by ${x.creator ?? "unknown"} (${x.source})`, page: x.foreign_landing_url, license: `CC ${String(x.license).toUpperCase()} ${x.license_version ?? ""}`.trim(), src: "openverse", attribution: true }));
  }
  console.log("  (Openverse not responding — try again in a minute)");
  return [];
}

const fetchBuf = async (url) => { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`download ${r.status}`); return Buffer.from(await r.arrayBuffer()); };

const credits = [];
const creditsFile = path.join(dir, "CREDITS.md");
const prevCredits = fs.existsSync(creditsFile) ? fs.readFileSync(creditsFile, "utf8") : "";

for (const a of list) {
  if (only && a.file !== only) continue;
  if (a.source && a.source !== "stock") continue;
  const out = path.join(dir, a.file);
  if (fs.existsSync(out) && !force) { console.log(`skip (exists) ${a.file}`); continue; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const q = a.query ?? a.prompt?.split(/[,.]/)[0];
  console.log(`\n${a.file}  ←  "${q}"`);

  let cands;
  if (a.url) cands = [{ url: a.url, credit: a.credit ?? "user supplied", page: a.url, license: a.license ?? "see source", src: "url" }];
  else {
    const orient = a.kind === "background" ? "portrait" : undefined;
    const search = async (qq) => {
      const [px, pb, ov] = await Promise.all([searchPexels(qq, orient).catch(() => []), searchPixabay(qq, orient).catch(() => []), searchOpenverse(qq).catch(() => [])]);
      const all = [];
      for (let i = 0; i < 20; i++) for (const s of [pb, px, ov]) if (s[i]) all.push(s[i]); // keyed providers first (cleaner shots)
      return all;
    };
    // relevance: how many of the query's words appear in the candidate's title/tags
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !["the", "and", "with", "view", "front", "side", "india", "indian", "isolated", "white", "background"].includes(w));
    const rel = (c) => { const t = (c.title ?? "").toLowerCase(); return words.length ? words.filter((w) => t.includes(w.replace(/s$/, ""))).length / words.length : 1; };
    // fall back to shorter queries if nothing comes back ("ghanta ghar clock tower" → "ghar clock tower" → "clock tower")
    const qWords = q.split(/\s+/);
    cands = [];
    for (let k = 0; k < qWords.length && cands.length < 3; k++) cands = await search(qWords.slice(k).join(" "));
    const strong = cands.filter((c) => c.src !== "openverse" || rel(c) >= 0.99);
    const ok = cands.filter((c) => c.src !== "openverse" || rel(c) >= 0.5);
    cands = strong.length >= 3 ? strong : ok.length >= 2 ? ok : cands;
  }
  if (!cands.length) { console.log("  no results — try a simpler/English query in assets.json"); continue; }

  if (a.kind === "background") {
    const c = cands[(a.pick ?? 1) - 1] ?? cands[0];
    fs.writeFileSync(out, await prepBackground(await fetchBuf(c.url)));
    credits.push({ file: a.file, ...c }); console.log(`  ok (${c.src})`); continue;
  }

  const tryList = a.pick ? [cands[a.pick - 1]].filter(Boolean) : cands.slice(0, N);
  const candDir = path.join(dir, "assets", "_candidates", path.basename(a.file, ".png"));
  fs.rmSync(candDir, { recursive: true, force: true }); fs.mkdirSync(candDir, { recursive: true });
  let best = null;
  for (let i = 0; i < tryList.length; i++) {
    const c = tryList[i];
    try {
      const buf = await fetchBuf(c.url);
      const res = await cutout(buf, { allowCut: a.allowCut });
      if (!res.png) { console.log(`  #${i + 1} empty`); continue; }
      fs.writeFileSync(path.join(candDir, `${String(i + 1).padStart(2, "0")}_${res.score}.png`), res.png);
      console.log(`  #${i + 1} score ${res.score}  (${res.info})  ${c.src}`);
      if (!best || res.score > best.score) best = { ...res, c, i };
    } catch (e) { console.log(`  #${i + 1} failed: ${e.message}`); }
  }
  if (!best) { console.log("  nothing usable"); continue; }
  fs.writeFileSync(out, best.png);
  credits.push({ file: a.file, ...best.c });
  console.log(`  → picked #${best.i + 1} (score ${best.score}). Others in ${path.relative(dir, candDir)}; set "pick": N in assets.json to choose another.`);
  if (best.score < 0.6) console.log(`  ⚠ low score — subject may be cut off or messy. Review it, change the query, or supply a "url".`);
}

if (credits.length) {
  const lines = credits.map((c) => `- **${c.file}** — ${c.credit}. ${c.license}. ${c.page}`);
  fs.writeFileSync(creditsFile, (prevCredits ? prevCredits.trimEnd() + "\n" : "# Image credits (put the CC ones in the video description)\n\n") + lines.join("\n") + "\n");
  console.log(`\nCredits → ${creditsFile}`);
}

// contact sheet of the chosen cutouts for quick review
const chosen = list.filter((a) => a.kind !== "background" && fs.existsSync(path.join(dir, a.file)));
if (chosen.length) {
  const tiles = await Promise.all(chosen.map(async (a) => sharp({ create: { width: 300, height: 300, channels: 4, background: "#A9C4C9" } })
    .composite([{ input: await sharp(path.join(dir, a.file)).resize(280, 280, { fit: "inside" }).toBuffer(), gravity: "center" }]).png().toBuffer()));
  const cols = 5, rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * 300, height: rows * 300, channels: 4, background: "#ffffff" } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 300, top: Math.floor(i / cols) * 300 }))).png()
    .toFile(path.join(dir, "assets", "_sheet.png"));
  console.log(`Review sheet → ${path.join(dir, "assets", "_sheet.png")}`);
}

// Validate a storyboard + list missing assets and write ASSET_PROMPTS.md for image generation.
// Usage: npm run check -- <name>
import fs from "node:fs";
import path from "node:path";
import { projectName, loadStoryboard, listPublic, referencedFiles, projectDir, musicDefaults } from "./lib.mjs";

const name = projectName();
const sb = loadStoryboard(name);
const files = new Set(listPublic());
const errors = [], warnings = [];

const SETS = ["layered-paper-stage", "skyline", "street", "balcony", "anatomy", "room", "office", "kitchen", "checker-room", "night-city", "sunrise", "jungle", "lab", "corkboard", "wood-desk", "paper", "showroom", "bank", "iceberg", "bedroom", "library"];
const TYPES = ["image", "prop", "cloud", "birds", "steam", "rain", "flare", "burst", "bubble", "note", "notifications", "stamp", "mark", "counter", "isotype", "bars", "ecg", "calendar", "body", "orbit", "text", "sfx", "price", "listing", "chat", "receipt", "newspaper", "balance", "figure", "reelfeed"];
const PROPS = ["alarm-clock", "phone", "chai", "battery", "stopwatch", "bell", "switch", "lightbulb", "question", "exclaim", "heart-icon", "moon", "sun", "shield", "pen", "coffee", "glasses", "ladder", "paper", "pole", "plant", "qr-stand", "book", "charger"];

const scenes = [...sb.scenes].sort((a, b) => a.start - b.start);
scenes.forEach((s, i) => {
  if (!s.id) errors.push(`scene #${i} has no id`);
  if (!(s.end > s.start)) errors.push(`scene ${s.id}: end must be > start`);
  if (i > 0 && Math.abs(scenes[i - 1].end - s.start) > 0.05) warnings.push(`gap/overlap between ${scenes[i - 1].id} (end ${scenes[i - 1].end}) and ${s.id} (start ${s.start})`);
  if (s.set?.builtin && !SETS.includes(s.set.builtin)) errors.push(`scene ${s.id}: unknown builtin set "${s.set.builtin}"`);
  if (!s.set) errors.push(`scene ${s.id}: missing set`);
  const dur = s.end - s.start;
  if (s.camera?.keyframes?.some((key, index, all) => !Number.isFinite(key.at) || key.at < 0 || key.at > dur + .001 || (index > 0 && key.at <= all[index - 1].at) || !Number.isFinite(key.zoom) || key.zoom < 1 || ![key.x, key.y].every(v => Number.isFinite(v) && v >= 0 && v <= 1))) errors.push(`scene ${s.id}: invalid camera keyframes`);
  if (dur > 8) warnings.push(`scene ${s.id} is ${dur.toFixed(1)}s long — reference style changes something every 1.5–3s; add headlines/layers or split it`);
  if (!(s.headlines ?? []).length) warnings.push(`scene ${s.id} has no headlines`);
  for (const h of s.headlines ?? []) {
    if (h.at < s.start - 0.01 || h.at > s.end) warnings.push(`scene ${s.id}: headline "${h.big ?? h.small}" at ${h.at}s is outside the scene`);
    if ((h.big ?? "").length > 18) warnings.push(`scene ${s.id}: big headline "${h.big}" is long (>18 chars) — will shrink; keep it punchy`);
  }
  for (const l of s.layers ?? []) {
    if (l.keyframes?.some((key, i, keys) => ![key.at,key.x,key.y,key.w,key.rotate ?? 0,key.opacity ?? 1].every(Number.isFinite) ||
      key.w <= 0 || (i > 0 && key.at <= keys[i - 1].at) || (key.opacity !== undefined && (key.opacity < 0 || key.opacity > 1)))) {
      errors.push(`scene ${s.id}: invalid layer keyframes`);
    }
    if (l.type === "angithi-world") {
      if (!["street","room","door","window","case","chemistry","breath","blood","symptoms","severity","safety"].includes(l.mode) || !Object.keys(l.art ?? {}).length || !Object.values(l.cues ?? {}).every(Number.isFinite))
        errors.push(`scene ${s.id}: invalid Angithi diorama or cue`);
    } else if (l.type === "action") {
      if (!["torch","powder","radar","breath","flame","depth","radio","rotor"].includes(l.kind)) errors.push(`scene ${s.id}: unknown action "${l.kind}"`);
    } else if (l.type === "ribbon-cutout") {
      if (!l.src || !(l.ratio > 0) || (l.amplitude !== undefined && (!(l.amplitude >= 0) || l.amplitude > 8))) errors.push(`scene ${s.id}: invalid ribbon cutout`);
    } else if (l.type === "paper-diagram") {
      if (!["globe","count","species","fang","pulse","clock","blocked","eye","breathing","antibodies","route","prompt"].includes(l.kind)) errors.push(`scene ${s.id}: unknown paper diagram "${l.kind}"`);
    } else if (l.type === "cloth-flag") {
      if (!l.src || (l.wind !== undefined && (!Number.isFinite(l.wind) || l.wind < 0 || l.wind > 1.5))) errors.push(`scene ${s.id}: cloth-flag requires a source and wind between 0 and 1.5`);
    } else if (l.type === "water-flow") {
      if (![l.source, l.target].every(point => Array.isArray(point) && point.length === 2 && point.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) ||
        (l.width !== undefined && (!Number.isFinite(l.width) || l.width <= 0))) errors.push(`scene ${s.id}: invalid water-flow geometry`);
    } else if (l.type === "trace") {
      if (typeof l.path !== "string" || !l.path.trim() || !(l.seconds > 0)) errors.push(`scene ${s.id}: trace requires an SVG path and positive seconds`);
    } else if (l.type === "articulated-cutout") {
      const validKeys = (keys) => !keys || keys.every((key, i) => key.every(Number.isFinite) && (i === 0 || key[0] > keys[i - 1][0]));
      const validPart = (part) => part?.outline && validKeys(part.poses) && validKeys(part.shifts) && validKeys(part.folds) && (!part.children || part.children.every(validPart));
      if (!l.src || !(l.ratio > 0) || !l.parts?.length || !l.parts.every(validPart)) errors.push(`scene ${s.id}: invalid articulated cutout geometry or pose timing`);
    } else if (l.type === "snow") {
      if (l.density !== undefined && (!Number.isInteger(l.density) || l.density < 1 || l.density > 120)) errors.push(`scene ${s.id}: snow density must be an integer from 1 to 120`);
    } else if (l.type === "atmosphere") {
      if (!["night-window","lamplight","breath","signal","contact-shadow"].includes(l.kind)) errors.push(`scene ${s.id}: unknown atmosphere "${l.kind}"`);
    } else if (l.type === "motion") {
      if (!["shield", "particle", "entry", "route", "brain", "stream", "foliage", "week", "year", "light", "ball", "pulse"].includes(l.kind)) {
        errors.push(`scene ${s.id}: unknown motion illustration "${l.kind}"`);
      }
    } else if (l.type === "clinical") {
      if (!["monitor", "prohibit", "anatomy-travel"].includes(l.kind)) errors.push(`scene ${s.id}: unknown clinical illustration "${l.kind}"`);
      if (l.kind === "anatomy-travel" && !l.src) errors.push(`scene ${s.id}: anatomy-travel requires an image`);
    } else if (l.type === "written-card") {
      if (!l.hand || !l.rows?.length || l.rows.some((row, i) => !row.text || row.dur <= 0 || (i > 0 && row.at < l.rows[i-1].at + l.rows[i-1].dur))) {
        errors.push(`scene ${s.id}: invalid written-card timing or missing hand`);
      }
    } else if (!TYPES.includes(l.type)) errors.push(`scene ${s.id}: unknown layer type "${l.type}"`);
    if (l.type === "prop" && !PROPS.includes(l.name)) errors.push(`scene ${s.id}: unknown prop "${l.name}"`);
    if (l.at !== undefined && (l.at < s.start - 0.01 || l.at > s.end)) warnings.push(`scene ${s.id}: layer ${l.type} at ${l.at}s is outside the scene`);
  }
});

// one marker hand: it can't draw two marks at once (close-together marks are chained into one hand journey automatically)
for (const s of scenes) {
  const win = [];
  for (const l of s.layers ?? []) {
    if (l.hand === false) continue;
    const at = l.at ?? s.start;
    if (l.type === "mark") win.push([at, at + 0.2 + (l.dur ?? 0.5), `mark ${l.kind}`]);
    for (const k of ["markAt", "markFirstAt", "markLastAt", "markTotalAt"]) if ((l.type === "price" || l.type === "listing" || l.type === "receipt" || l.type === "newspaper") && l[k] !== undefined) win.push([at + l[k], at + l[k] + 0.62, `${l.type} ${k}`]);
  }
  win.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < win.length; i++) if (win[i][0] < win[i - 1][1] - 0.02)
    warnings.push(`scene ${s.id}: two marks drawn at the same time (${win[i - 1][2]} until ${win[i - 1][1].toFixed(2)}s, ${win[i][2]} starts ${win[i][0].toFixed(2)}s) — start the next one after the previous stroke ends`);
}

const refs = referencedFiles(name, sb);
const missing = refs.filter((r) => !files.has(r.path));

// Asset prompt sheet for ChatGPT / Gemini
const promptsFile = path.join(projectDir(name), "assets.json");
const prompts = fs.existsSync(promptsFile) ? JSON.parse(fs.readFileSync(promptsFile, "utf8")) : [];
const byFile = new Map(prompts.map((p) => [p.file, p]));
const lines = [`# Images to generate for "${sb.title}"`, "",
  "Paste each prompt into ChatGPT (or Gemini). Download the PNG and save it with EXACTLY the file name shown, into:",
  `\`public/projects/${name}/\``, ""];
for (const r of missing.filter((m) => m.kind === "cutout" || m.kind === "background")) {
  const rel = r.path.replace(`projects/${name}/`, "");
  const p = byFile.get(rel);
  lines.push(`## ${rel}  (${r.kind}, ${r.where})`, "", "```", p?.prompt ?? "(no prompt in assets.json — add one)", "```", "");
}
fs.writeFileSync(path.join(projectDir(name), "ASSET_PROMPTS.md"), lines.join("\n"));

console.log(`\n== ${sb.title} ==  ${scenes.length} scenes, ${scenes.at(-1)?.end ?? 0}s`);
console.log(sb.music
  ? `Music: ${sb.music}${sb._musicAuto ? " (kit default)" : ""} at ${Math.round((sb.musicVolume ?? musicDefaults.musicVolume) * 1000) / 10}%`
  : "Music: none — put royalty-free tracks in public/music/ (see public/music/README.md)");
if (errors.length) console.log(`\nERRORS:\n - ${errors.join("\n - ")}`);
if (warnings.length) console.log(`\nWarnings:\n - ${warnings.join("\n - ")}`);
if (missing.length) {
  console.log(`\nMissing files (${missing.length}) — they render as red "MISSING ASSET" boxes:`);
  for (const m of missing) console.log(` - public/${m.path}   [${m.kind}, ${m.where}]`);
  console.log(`\nMake them for free:  npm run stock -- ${name}     (manual prompts: public/projects/${name}/ASSET_PROMPTS.md)`);
} else console.log("\nAll referenced files present.");
process.exit(errors.length ? 1 : 0);

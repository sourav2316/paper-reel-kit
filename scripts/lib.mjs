import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC = path.join(ROOT, "public");

export const projectName = () => {
  const name = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!name) {
    console.error("Usage: npm run <script> -- <project-name>   (folder inside public/projects/)");
    process.exit(1);
  }
  return name;
};

export const flag = (name, def) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : def;
};

export const projectDir = (name) => path.join(PUBLIC, "projects", name);

export const loadStoryboard = (name) => {
  const p = path.join(projectDir(name), "storyboard.json");
  if (!fs.existsSync(p)) { console.error(`No storyboard at ${p}`); process.exit(1); }
  const sb = JSON.parse(fs.readFileSync(p, "utf8"));
  // Every video gets background music: if the storyboard doesn't name a track, pick one from public/music/
  // (stable per project name, so re-renders keep the same track). "music": false turns it off.
  if (sb.music === undefined) {
    const dir = path.join(PUBLIC, "music");
    const tracks = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /.(mp3|wav|m4a|ogg)$/i.test(f)).sort() : [];
    if (tracks.length) {
      const h = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
      sb.music = `/music/${tracks[h % tracks.length]}`;
      sb._musicAuto = true;
    }
  }
  if (sb.music === false) delete sb.music;
  return sb;
};

/** All files under public/ as forward-slash relative paths. */
export const listPublic = () => {
  const out = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, f.name);
      if (f.isDirectory()) walk(full);
      else out.push(path.relative(PUBLIC, full).split(path.sep).join("/"));
    }
  };
  walk(PUBLIC);
  return out;
};

export const resolveAsset = (name, p) => (p.startsWith("/") ? p.slice(1) : `projects/${name}/${p}`);

export const totalSeconds = (sb) => Math.max(...sb.scenes.map((s) => s.end)) + (sb.endPadding ?? 0.5);

/** Every file a storyboard references. */
export const referencedFiles = (name, sb) => {
  const refs = [];
  if (sb.audio) refs.push({ path: resolveAsset(name, sb.audio), where: "audio", kind: "audio" });
  if (sb.music) refs.push({ path: resolveAsset(name, sb.music), where: "music", kind: "audio" });
  for (const s of sb.scenes) {
    if (s.set?.image) refs.push({ path: resolveAsset(name, s.set.image), where: `scene ${s.id} background`, kind: "background" });
    for (const v of s.set?.variants ?? []) refs.push({ path: resolveAsset(name, v.image), where: `scene ${s.id} background variant`, kind: "background" });
    for (const l of s.layers ?? []) {
      if (l.type === "listing" && l.img) refs.push({ path: resolveAsset(name, l.img), where: `scene ${s.id} listing`, kind: "cutout" });
      if (l.type === "image") refs.push({ path: resolveAsset(name, l.src), where: `scene ${s.id}`, kind: "cutout" });
      if (l.sfx) refs.push({ path: resolveAsset(name, l.sfx), where: `scene ${s.id} sfx`, kind: "sfx" });
    }
  }
  return refs;
};

// Remove the background of images you already have (made in ChatGPT / Codex / by hand).
// Usage: npm run cutout -- <name> [--only=assets/man.png] [--force]
// Works on every assets.json entry with kind "cutout" whose file exists. The original is kept as <file>.orig.png,
// so running it twice is safe (it re-cuts from the original only with --force).
import fs from "node:fs";
import path from "node:path";
import { projectName, projectDir, flag } from "./lib.mjs";
import { cutout } from "./cutout-lib.mjs";

const name = projectName();
const dir = projectDir(name);
const list = JSON.parse(fs.readFileSync(path.join(dir, "assets.json"), "utf8"));
const only = flag("only");
const force = process.argv.includes("--force");

for (const a of list) {
  if (a.kind !== "cutout" || (only && a.file !== only)) continue;
  const file = path.join(dir, a.file);
  const orig = file.replace(/\.png$/i, "") + ".orig.png";
  if (!fs.existsSync(file) && !fs.existsSync(orig)) { console.log(`missing ${a.file}`); continue; }
  if (fs.existsSync(orig) && !force) { console.log(`skip (already cut) ${a.file}`); continue; }
  if (!fs.existsSync(orig)) fs.copyFileSync(file, orig);
  process.stdout.write(`cutting ${a.file} … `);
  const res = await cutout(fs.readFileSync(orig), { allowCut: a.allowCut });
  if (!res.png) { console.log("failed (empty mask), kept original"); continue; }
  fs.writeFileSync(file, res.png);
  console.log(`ok (score ${res.score})`);
}

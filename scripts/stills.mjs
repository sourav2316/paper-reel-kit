// Export review stills: out/<name>-stills/t_XX.X.jpg every N seconds (default 1)
// Usage: npm run stills -- <name> [--every=1] [--at=3.2,7.5]
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, projectName, loadStoryboard, listPublic, flag, totalSeconds } from "./lib.mjs";

const name = projectName();
const storyboard = loadStoryboard(name);
const every = Number(flag("every", "1"));
const at = flag("at");
const fps = 30;
const inputProps = { storyboard, base: `projects/${name}`, available: listPublic() };

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Reel", inputProps });
const dir = path.join(ROOT, "out", `${name}-stills`);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

const times = at ? at.split(",").map(Number) : Array.from({ length: Math.floor(totalSeconds(storyboard) / every) + 1 }, (_, i) => i * every);
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * fps));
  const output = path.join(dir, `t_${t.toFixed(1).padStart(5, "0")}.jpg`);
  await renderStill({ composition, serveUrl, output, frame, inputProps, imageFormat: "jpeg", jpegQuality: 80, scale: 0.4 });
  process.stdout.write(".");
}
console.log(`\n${times.length} stills in ${dir}`);

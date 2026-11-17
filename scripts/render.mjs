// Render a project to out/<name>.mp4
// Usage: npm run render -- <name> [--quality=draft|final] [--from=sec --to=sec]
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { ROOT, projectName, loadStoryboard, listPublic, flag, totalSeconds } from "./lib.mjs";

const name = projectName();
const storyboard = loadStoryboard(name);
const quality = flag("quality", "final");
const { draftFps, finalFps } = JSON.parse(fs.readFileSync(path.join(ROOT, "src/render-defaults.json"), "utf8"));
const frameRate = quality === "draft" ? draftFps : finalFps;

const inputProps = { storyboard, frameRate, base: `projects/${name}`, available: listPublic() };

console.log(`Bundling…`);
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Reel", inputProps });

const { fps } = composition;
const from = flag("from"), to = flag("to");
const frameRange = from || to ? [Math.round(Number(from ?? 0) * fps), Math.min(composition.durationInFrames - 1, Math.round(Number(to ?? totalSeconds(storyboard)) * fps))] : undefined;

fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
const outputLocation = path.join(ROOT, "out", `${name}${quality === "draft" ? "-draft" : ""}.mp4`);
console.log(`Rendering ${composition.durationInFrames} frames (${(composition.durationInFrames / fps).toFixed(1)}s) → ${outputLocation}`);
let last = -1;
await renderMedia({
  composition, serveUrl, codec: "h264", outputLocation, inputProps, frameRange,
  crf: quality === "draft" ? 28 : 17,
  scale: quality === "draft" ? 0.5 : 1,
  concurrency: null,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; process.stdout.write(`${Math.round(progress * 100)}% `); } },
});
console.log(`\nDone: ${outputLocation}`);

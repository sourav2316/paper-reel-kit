// Render a thumbnail: npm run thumb -- <name>   (reads public/projects/<name>/thumbnail.json → out/<name>-thumbnail.jpg/.png)
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { ROOT, projectName, projectDir, listPublic } from "./lib.mjs";

const name = projectName();
const tf = path.join(projectDir(name), "thumbnail.json");
if (!fs.existsSync(tf)) { console.error("No thumbnail.json in " + projectDir(name)); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(tf, "utf8"));
const inputProps = { ...spec, base: `projects/${name}`, available: listPublic() };
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Thumb", inputProps });
fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
for (const [fmt, ext] of [["png", "png"], ["jpeg", "jpg"]]) {
  const output = path.join(ROOT, "out", `${name}-thumbnail.${ext}`);
  await renderStill({ composition, serveUrl, output, frame: 0, inputProps, imageFormat: fmt, ...(fmt === "jpeg" ? { jpegQuality: 92 } : {}) });
  console.log("→ " + output);
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const library = path.join(root, "library");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".avif"]);

function collectImages(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) return collectImages(file);
    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      return [path.relative(root, file).split(path.sep).join("/")];
    }
    return [];
  });
}

const projectAssets = collectImages(path.join(root, "public")).sort();
const originals = collectImages(path.join(library, "originals")).sort();
fs.mkdirSync(library, { recursive: true });
fs.writeFileSync(path.join(library, "index.json"), JSON.stringify({ projectAssets, originals }, null, 2) + "\n");
console.log(`Library indexed: ${projectAssets.length} project images, ${originals.length} source images`);

// Contact sheet of all candidates for some assets: node scripts/candsheet.mjs <project> name1,name2 out.png
import fs from "node:fs"; import path from "node:path"; import sharp from "sharp";
const [proj, names, outFile] = process.argv.slice(2);
const base = path.join("public/projects", proj, "assets/_candidates");
const rows = [];
for (const n of names.split(",")) {
  const d = path.join(base, n); if (!fs.existsSync(d)) continue;
  const files = fs.readdirSync(d).filter((f) => f.endsWith(".png")).sort();
  rows.push(await Promise.all(files.map(async (f) => sharp({ create: { width: 220, height: 220, channels: 4, background: "#A9C4C9" } })
    .composite([{ input: await sharp(path.join(d, f)).resize(200, 180, { fit: "inside" }).toBuffer(), gravity: "north" },
      { input: Buffer.from(`<svg width="220" height="40"><text x="6" y="30" font-size="22" font-family="Arial">${n.slice(0, 9)} ${f.slice(0, 2)}</text></svg>`), gravity: "south" }]).png().toBuffer())));
}
const W = 220 * Math.max(...rows.map((r) => r.length)), H = 220 * rows.length;
await sharp({ create: { width: W, height: H, channels: 4, background: "#fff" } }).composite(rows.flatMap((r, y) => r.map((t, x) => ({ input: t, left: x * 220, top: y * 220 })))).png().toFile(outFile);

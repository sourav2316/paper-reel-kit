// OPTIONAL: generate missing images automatically through an API.
// Needs an API key (this is separate from a ChatGPT Plus / Gemini app subscription):
//   OPENAI_API_KEY=...  (uses OPENAI_IMAGE_MODEL, default "gpt-image-1", transparent PNG for cutouts)
//   GEMINI_API_KEY=...  (uses GEMINI_IMAGE_MODEL, default "gemini-2.5-flash-image")
// Put keys in a .env file in the kit root or in the environment.
// Without a key: open public/projects/<name>/ASSET_PROMPTS.md and paste the prompts into the ChatGPT / Gemini app instead.
// Usage: npm run images -- <name> [--provider=openai|gemini] [--only=file.png] [--force]
import fs from "node:fs";
import path from "node:path";
import { ROOT, projectName, projectDir, flag } from "./lib.mjs";

// tiny .env loader
const envFile = path.join(ROOT, ".env");
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const name = projectName();
const dir = projectDir(name);
const list = JSON.parse(fs.readFileSync(path.join(dir, "assets.json"), "utf8"));
const provider = flag("provider", process.env.OPENAI_API_KEY ? "openai" : process.env.GEMINI_API_KEY ? "gemini" : "none");
const only = flag("only");
const force = process.argv.includes("--force");

if (provider === "none" || provider === "stock") {
  console.log("No paid image API configured → using the FREE stock-photo route (npm run stock).");
  await import("./stock.mjs");
  process.exit(0);
}

const STYLE_CUTOUT = "Photorealistic, isolated object on a fully transparent background (or pure white if transparency unsupported), soft studio light from top-left, slightly desaturated vintage film look, muted warm tones, crisp edges, entire object in frame, no text, no watermark, no ground shadow.";
const STYLE_BG = "Vertical 9:16 illustration in a muted vintage paper-collage style: flat shapes, subtle paper grain, soft warm light, desaturated palette of sky blue #A9C4C9, cream #EFE6D2, brick red #C0392B, mustard #E3B23C. Leave the top 22% visually calm for a headline. No text, no people unless asked.";

const genOpenAI = async (a) => {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt: `${a.prompt}\n\n${a.kind === "background" ? STYLE_BG : STYLE_CUTOUT}`,
      size: a.kind === "background" ? "1024x1536" : (a.size ?? "1024x1024"),
      background: a.kind === "background" ? "opaque" : "transparent",
      output_format: "png", quality: "high", n: 1,
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(j.error ?? j));
  return Buffer.from(j.data[0].b64_json, "base64");
};

const genGemini = async (a) => {
  const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: `${a.prompt}\n\n${a.kind === "background" ? STYLE_BG : STYLE_CUTOUT.replace("fully transparent background (or pure white if transparency unsupported)", "pure plain white background")}` }] }] }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(j.error ?? j));
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error("no image in response");
  return Buffer.from(part.inlineData.data, "base64");
};

for (const a of list) {
  if (only && a.file !== only) continue;
  if (a.source !== "ai") continue; // stock + manual entries are handled by `npm run stock`
  const out = path.join(dir, a.file);
  if (fs.existsSync(out) && !force) { console.log(`skip (exists) ${a.file}`); continue; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  process.stdout.write(`${provider}: ${a.file} … `);
  try {
    let buf = provider === "gemini" ? await genGemini(a) : await genOpenAI(a);
    if (a.kind !== "background") {
      const { cutout } = await import("./cutout-lib.mjs");
      const res = await cutout(buf, { allowCut: a.allowCut });
      if (res.png) buf = res.png;
    }
    fs.writeFileSync(out, buf);
    console.log("ok (background removed locally)");
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }
}

// everything not marked source:"ai" comes from the free stock route
await import("./stock.mjs");

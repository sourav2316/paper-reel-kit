// Voiceover → word timestamps (local, free, offline after first run) using whisper.cpp.
// Usage: npm run transcribe -- <name> [--model=small] [--lang=en|hi|auto]
// Reads  public/projects/<name>/<storyboard.audio or vo.mp3>
// Writes public/projects/<name>/transcript.json  (words with start/end seconds) + transcript.txt (readable, one line per phrase)
import path from "node:path";
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { ROOT, projectName, projectDir, flag } from "./lib.mjs";

const name = projectName();
const dir = projectDir(name);
const sbPath = path.join(dir, "storyboard.json");
const sb = fs.existsSync(sbPath) ? JSON.parse(fs.readFileSync(sbPath, "utf8")) : {};
const audio = path.join(dir, sb.audio ?? flag("audio", "vo.mp3"));
if (!fs.existsSync(audio)) { console.error(`Audio not found: ${audio}`); process.exit(1); }

const model = flag("model", "small");          // tiny | base | small | medium (bigger = more accurate, slower)
const lang = flag("lang", "auto");
const WHISPER = path.join(ROOT, "whisper.cpp");
const VERSION = "1.5.5";

await installWhisperCpp({ to: WHISPER, version: VERSION });
await downloadWhisperModel({ model, folder: WHISPER });

// whisper needs 16 kHz mono wav — use the ffmpeg bundled with Remotion
const wav = path.join(dir, ".vo16k.wav");
execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["remotion", "ffmpeg", "-y", "-i", audio, "-ar", "16000", "-ac", "1", wav], { stdio: "inherit", shell: process.platform === "win32" });

const result = await transcribe({
  inputPath: wav, whisperPath: WHISPER, whisperCppVersion: VERSION, model,
  // token-level splits Devanagari into broken bytes → use whole segments for non-English audio
  tokenLevelTimestamps: lang === "en", language: lang === "auto" ? null : lang,
});
const { captions } = toCaptions({ whisperCppOutput: result });
const words = captions.map((c) => ({ text: c.text.trim(), start: +(c.startMs / 1000).toFixed(2), end: +(c.endMs / 1000).toFixed(2) })).filter((w) => w.text);
fs.writeFileSync(path.join(dir, "transcript.json"), JSON.stringify({ words }, null, 1));

// Readable version from whole SEGMENTS (token-level text breaks Hindi/Devanagari into broken bytes; segment text is clean).
const segs = (result.transcription ?? []).map((s) => ({ start: s.offsets.from / 1000, end: s.offsets.to / 1000, text: (s.text ?? "").trim() })).filter((s) => s.text);
const lines = segs.map((s) => `[${s.start.toFixed(2)} – ${s.end.toFixed(2)}]  ${s.text}`);
const garbled = lines.join("").includes("�");
fs.writeFileSync(path.join(dir, "transcript.txt"), garbled
  ? "# Recognised text is unreliable for this language (whisper splits Devanagari into broken characters).\n" +
    "# Use the user's SCRIPT for the words and speech_segments.txt for the timing: split the script at commas and\n" +
    "# full stops, and match each phrase in order to one speech segment.\n"
  : lines.join("\n"));

// Exact speech segments from silence detection (the most reliable timing source; match them to the script lines in order).
// silencedetect prints to stderr → capture both streams
const sd = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx",
  ["remotion", "ffmpeg", "-hide_banner", "-i", wav, "-af", "silencedetect=noise=-35dB:d=0.22", "-f", "null", "-"],
  { encoding: "utf8", shell: process.platform === "win32", maxBuffer: 64 * 1024 * 1024 });
const pauses = String(sd.stderr ?? "") + String(sd.stdout ?? "");
const marks = [...pauses.matchAll(/silence_(start|end): ([0-9.]+)/g)].map((m) => [m[1], Number(m[2])]);
const speech = []; let from = 0;
for (const [kind, v] of marks) { if (kind === "start") { if (v - from > 0.15) speech.push([from, v]); } else from = v; }
const total = segs.at(-1)?.end ?? from;
if (total - from > 0.15) speech.push([from, total]);
fs.writeFileSync(path.join(dir, "speech_segments.txt"),
  "# Speech segments (between pauses). Match them IN ORDER to the script's phrases to get exact times.\n" +
  speech.map(([a, b], i) => `${String(i + 1).padStart(2, "0")}  ${a.toFixed(2)} – ${b.toFixed(2)}`).join("\n"));
fs.rmSync(wav, { force: true });
console.log(`\n${words.length} words → transcript.json · ${segs.length} lines → transcript.txt · ${speech.length} speech segments → speech_segments.txt\n`);
console.log(lines.join("\n"));

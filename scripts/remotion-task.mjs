import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const tasks = new Set(["render", "stills", "thumb"]);
const task = process.argv[2];
if (!tasks.has(task)) throw new Error(`Unknown Remotion task: ${task}`);

const scripts = path.dirname(fileURLToPath(import.meta.url));
const temporaryRoot = path.resolve(scripts, "../out/.remotion-temp");
fs.mkdirSync(temporaryRoot, { recursive: true });
const resolvedRoot = fs.realpathSync(temporaryRoot);
const workspace = fs.mkdtempSync(path.join(resolvedRoot, `${task}-`));
const entry = path.join(scripts, `${task}.mjs`);

try {
  process.exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry, ...process.argv.slice(3)], {
      env: { ...process.env, TEMP: workspace, TMP: workspace, TMPDIR: workspace },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("close", code => resolve(code ?? 1));
  });
} finally {
  try {
    const resolvedWorkspace = fs.realpathSync(workspace);
    if (path.dirname(resolvedWorkspace) !== resolvedRoot || resolvedWorkspace !== workspace) {
      throw new Error(`Unexpected Remotion temp path: ${resolvedWorkspace}`);
    }
    await fs.promises.rm(resolvedWorkspace, { recursive: true, maxRetries: 10, retryDelay: 400 });
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Could not clean Remotion temp files: ${error.message}`);
  }
}

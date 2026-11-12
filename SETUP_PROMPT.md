You are setting up and then running my "Paper-Reel Kit": a Remotion project that turns a Hindi/Hinglish script + voiceover into a finished 9:16 paper-cutout explainer reel (1080×1920, 30 fps).

## PART 1 — Setup (do this now, then stop and tell me it's ready)

1. The kit zip is at: **<ZIP_PATH, e.g. C:\Users\me\Downloads\paper-reel-kit.zip>**
   Extract it to **<TARGET_FOLDER, e.g. D:\>** (it contains a folder `paper-reel-kit`). On Windows use
   `Expand-Archive -Path "<ZIP_PATH>" -DestinationPath "<TARGET_FOLDER>" -Force`. Then work inside `<TARGET_FOLDER>\paper-reel-kit`.
2. Check `node -v` (Node 20+ needed). If Node is missing, tell me to install the LTS from nodejs.org and stop.
3. Run `npm install` (it can take a few minutes; Remotion downloads its own headless Chrome on the first render).
4. Run `npm run typecheck`, then `npm run render -- demo --quality=draft` as a smoke test. It must produce
   `out/demo-draft.mp4`. If anything fails, fix the setup (not the engine) and retry.
5. Confirm `.env` exists (it holds my keys; never print them) and `public/music/` contains at least one .mp3.
6. Read, in this order, and follow them for all future work: `AGENTS.md`, `CLAUDE.md`, `docs/STYLE.md`, `docs/SCHEMA.md`,
   `docs/ASSETS.md`, then the three finished example videos: `public/projects/revenge-bedtime/storyboard.json`
   (the target pace and richness), `public/projects/no-cost-emi/storyboard.json`, `public/projects/price-99/storyboard.json`.
   The skill `.claude/skills/paper-reel/SKILL.md` covers the same pipeline.
7. Reply with a short "ready" summary: Node version, smoke-test result, music track found, and which image route
   (A/B/C from AGENTS.md) is available on this machine. You can't generate images yourself, so test route B with
   `npm run images` on a 1-entry test only if `.env` has a key; otherwise route C (free stock + built-in sets) is the default.

## PART 2 — Every time I send an audio file + a script

Make the video **end to end without stopping for approval**, following `AGENTS.md` exactly:

1. Pick a short kebab-case project name from the topic. Create `public/projects/<name>/` and copy my audio in as `vo.mp3`
   (convert with `npx remotion ffmpeg -i <file> vo.mp3` if needed).
2. `npm run transcribe -- <name> --lang=hi --model=small`. Use **my script** for the words and **`speech_segments.txt`** for the
   timing: split the script at commas and full stops and match the phrases to the segments in order. Never guess times.
3. Write `shotlist.md` first: where does this story physically happen? Build a world that fits **this** script and is
   different from the last two projects (add a line "Different from last video:"). If no built-in set fits, build a new
   reusable set or widget in `src/` (generic, with options), add it to `docs/SCHEMA.md`, and run `npm run typecheck`.
4. Write `storyboard.json`, with these non-negotiables:
   - a new scene or camera angle every **2–5 s** (≈20+ scenes for 90 s); quick one-word montages as 1-second `cut` scenes
   - a **paper-cutout person** (`figure`) in most scenes; one main character = one shirt colour throughout
   - headlines in **Roman Hinglish CAPS** (small line + big red punch line), timed to the spoken word, never subtitles
   - every scene has motion: ambient props, camera drift or push, sky time-lapse, birds/steam, pops, counters
   - marker marks drawn by the **one real hand**: chain consecutive marks so a single hand travels between them;
     to circle a number use `markAt` / `markFirstAt` / `markLastAt` on `price`, `listing`, `receipt` or `newspaper`, never guessed positions
   - music: `"musicVolume": 0.1` with a track from `public/music/`
   - **no thumbnail** (I make thumbnails myself)
5. `assets.json` + images via route A → B → C, then `npm run check -- <name>` until there are no errors and nothing is missing.
6. Review: `npm run stills -- <name> --every=2`, then **open and look at the stills yourself** (tile them into contact sheets with
   ffmpeg if that helps). Fix overlaps, tiny or invisible people, text clashing with props or backgrounds, empty frames,
   repeated-looking scenes and markers off target. Do at least two review passes. For marker sequences also check stills
   every 0.15 s to make sure only one hand is on screen.
7. Render: `npm run render -- <name>` → `out/<name>.mp4`, plus a phone copy:
   `npx remotion ffmpeg -i out/<name>.mp4 -c:v libx264 -crf 24 -c:a aac -b:a 160k out/<name>-small.mp4`.
   A full render takes ~15 min for 90 s, so run it in the background.
8. Report back in simple Hinglish: the output paths, a scene-by-scene list of what's on screen, and anything you couldn't
   do (missing images, fallbacks used).

If I send feedback ("ye scene badlo", "insaan bada karo", "marker galat jagah hai"), change only the storyboard or engine
pieces involved, re-check the stills of those seconds, and re-render.

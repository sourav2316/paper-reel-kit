# Paper-Reel Kit — instructions for the AI agent (ChatGPT/Codex, Claude, any agent)

You turn a **script + voiceover audio** into a finished 9:16 explainer reel in one fixed visual style:
**"2.5D paper-cutout collage explainer"**. The style is already built in code. You never change the engine to get
the look; you write ONE file — `public/projects/<name>/storyboard.json` — and render it.

Read these before your first video: `docs/STYLE.md` (how to direct), `docs/SCHEMA.md` (every field), `docs/ASSETS.md`
(images), and the three finished videos below.

**Quality bar = these finished projects** (open their `storyboard.json`; your video must be at least this rich):
- `public/projects/revenge-bedtime/`: 22 scenes in 97 s, paper-cutout person in almost every scene, bedroom sky
  time-lapse, reel feed, montage cuts. **This is the closest to the target style. Copy its pacing, not its sets.**
- `public/projects/no-cost-emi/`: topic-built world (showroom, bank, newspaper, balance scale, iceberg).
- `public/projects/price-99/`: marker hand chained across 3 prices, price "scan" effect.

## The pipeline (do every step, in order)

1. **Set up the project folder.** The user gives a topic, a script and an audio file. Create
   `public/projects/<short-kebab-name>/`, copy the audio in as `vo.mp3` (any format works; keep the extension
   and set `"audio"` to match). If `node_modules` is missing, run `npm install` first.
2. **Get timestamps.** Run `npm run transcribe -- <name> --lang=hi --model=small` (`--lang=en` for English).
   It writes `transcript.txt` (sentences with times), `transcript.json` (word times) and **`speech_segments.txt`**
   (exact start–end of every spoken chunk between pauses). The user gives you the script: split it into phrases at
   commas/full stops and match them **in order** to the speech segments. That gives near-frame-exact timing. Never guess times.
3. **Direct the shot list.** Before writing JSON, write `public/projects/<name>/shotlist.md`. It's a table with
   one row per scene: time range · VO phrase · set · people/props/metaphor · headline words · transition. Follow
   `docs/STYLE.md` and the rules below. Then continue straight away. Stop for approval only if the user asked to review.
4. **Write `storyboard.json`.** Follow `docs/SCHEMA.md` exactly. Scenes must tile the timeline with no gaps:
   the first scene starts at 0, each scene's `start` equals the previous `end`, and the last scene `end` is the
   end of the voiceover.
5. **List the images.** Write `public/projects/<name>/assets.json` with one entry per image the storyboard references
   (`file`, `kind: "cutout" | "background"`, plus `prompt` for AI and `query` for stock). Follow `docs/ASSETS.md`.
6. **Validate.** Run `npm run check -- <name>`. Fix every ERROR, fix the warnings where you can, and run it
   again. The command also writes `ASSET_PROMPTS.md`.
7. **Make the images.** Use the first route that works (details in "Images" below):
   **A** your own built-in image generation tool → **B** an API key in `.env` (`npm run images`) → **C** free stock
   (`npm run stock`) + built-in sets/figures/props. Afterwards **look at every image** (`assets/_sheet.png`), fix
   bad ones, and run `npm run check` until nothing is missing. Missing images never block you. They render as
   red "MISSING ASSET" boxes, so you can review the motion first.
8. **Review stills.** Run `npm run stills -- <name>` (one still per second, in `out/<name>-stills/`). Open and
   look at them. Check for: text overlapping props, empty or static-looking frames, items cut off at the edges,
   headlines out of sync, or more than ~3 s without a new visual beat. Fix the JSON and repeat.
9. **Render.** Run `npm run render -- <name> --quality=draft` for a quick half-resolution check, then
   `npm run render -- <name>` for the final `out/<name>.mp4` (1080×1920, 30 fps, h264).
10. **Report to the user.** Give the output path, a list of any images still missing, and a short note on what
    you would improve.

## Background music (every video)
New renders use the Epic Music Waves track configured in `src/music-defaults.json` with fades. The user's preferred
level is **8%** (`"musicVolume": 0.08`). Leave the track and volume unset to use the defaults unless the user requests an override. If `public/music/` is empty, tell the user to add royalty-free
tracks (see `public/music/README.md`). Never use film songs or trending audio.

## People in every video
Show a person whenever the script talks about "you", a worker, a student, a friend: use the `figure` layer (paper-cutout
human, 9 poses). One main character = one shirt colour through the whole video. A realistic person (face, emotion,
specific action) is an `image` cutout: generate it (see "Images" below) — never use a random real person's photo.

## Images (backgrounds and people)
**Route A: your own image tool (preferred when you have one).** If you (Codex / ChatGPT) can generate images
yourself, do it for every AI entry in `assets.json`. Save each one at its exact `file` path, as PNG.
- **Backgrounds** (`kind: "background"`): 1024×1536 portrait (9:16). Start every prompt with the house style:
  *"Cinematic 2.5D painted illustration, vertical 9:16, warm dramatic lighting, soft paper-collage texture,
  slightly desaturated vintage palette (deep blues, warm amber, brick red, cream), detailed but uncluttered,
  no text, no logos. Keep the top 25% calm and dark for a headline."* Then describe the place from the script.
- **Time-lapse in one place** (day → evening → night, lights switching on): generate the first image, then edit
  **that same image** into the other times of day ("same image, same camera, now at sunset" / "at night, street
  lights on"). Put them in `set.variants` (see `docs/SCHEMA.md`) and they crossfade at the given seconds.
- **People / hands / objects** (`kind: "cutout"`): *"…isolated on a plain white background, soft studio light,
  full subject in frame, no text"*. POV hands: *"first-person view, hands entering from the bottom edge"*.
  Then run `npm run cutout -- <name>` to remove the white background (the original is kept as `.orig.png`).
- Make one image per new place (≈8–15 backgrounds per video) and reuse each for 2–3 scenes with different camera
  framing (`camera.zoomFrom/zoomTo/focusX/focusY`) and different layers on top.

**Route B: API key in `.env`** (`GEMINI_API_KEY` or `OPENAI_API_KEY`, with billing on): the same entries with
`"source": "ai"` and a `prompt`, then run `npm run images -- <name>`. Cutouts get their background removed locally.

**Route C: free, no AI at all:** `npm run stock -- <name>` for objects (vehicles, food, tools, animals, devices);
built-in `sets` for places; `figure` for people. This route still has to look rich: use more layers, more props,
`skyChanges`, camera moves and quick cuts. Never leave a scene with just a background and a headline.

When an AI image for a person or a place is missing, don't block. Fall back to route C for that scene.

## Pace
Change the scene or the camera angle every **2–5 s** (≈20+ scenes per 90 s), like the reference channel. A quick
montage ("office, padhai, ghar ke kaam") = one 1-second scene per word with `transitionIn: "cut"`.

## Thumbnail
Don't make one. The user makes thumbnails separately in ChatGPT.

## Every video must look different (same style, new world)
The *style* stays the same: paper look, headlines, motion, marker hand. The *world* must come from the topic.
1. Before the shot list, write down where this story physically happens (e.g. EMI → phone showroom, bank hall,
   newspaper, iceberg for "hidden cost"; health → hospital, kitchen, body). Pick sets that match.
2. Open the last 2 projects in `public/projects/` and **do not reuse their set line-up or their key metaphors**.
   A set may repeat only if the story really happens there (no street when nothing happens on a street).
3. If no built-in set fits, build a new reusable set in `src/sets/` (generic + options) rather than
   forcing an unrelated one, and add it to `docs/SCHEMA.md`. Same for a new widget when the key metaphor needs one
   (balance scale for "equal", iceberg for "hidden").
4. In `shotlist.md`, add a line "Different from last video:" naming what is new.

## Hard rules (these keep the style "ditto")

- Use only the sets, layer types and props listed in `docs/SCHEMA.md`. If something isn't built in, use an
  `image` layer with a generated cutout. Don't invent new JSON fields; they're ignored.
- Do **not** edit `src/` to make one video. Edit engine code only if the user asks for a new reusable feature.
  When you do, keep it generic, add it to `docs/SCHEMA.md`, and run `npm run typecheck`.
- Headlines: a short `small` line (1–3 words) and a punchy `big` line (1–3 words, ≤ 16 characters). Write
  them in ALL CAPS. They are keywords from the VO, **not subtitles**. A new headline every 1.5–3 s, timed to the
  word that's spoken (`big` slams in on the stressed word; set `bigAt` to that word's start time).
- Something changes on screen at least every 1.5–2 s: a headline, a pop, a mark drawing itself, a camera push,
  a vehicle crossing. Every scene also gets ambient motion (birds, steam, `ambient` on props, camera drift).
- Reuse 3–4 "home sets" through the video (for example: a street, the anatomy board, a room). Return to them
  with new props. That continuity is the signature of this style.
- Transitions: use `scan` when going "inside" (into the body, into the mind, behind the scenes), `blur` for
  most cuts, `push` for emphasis, `wipe-left` for "next point", `cut` plus `tintChanges` for a mood shift
  inside the same set.
- Colours come from the theme. Don't use colours outside the palette in `docs/STYLE.md`.
- Keep important things inside x 0.06–0.94 and y 0.12–0.92. The top 12–26% is reserved for the headline.

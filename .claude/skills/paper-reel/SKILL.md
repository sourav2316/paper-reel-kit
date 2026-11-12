---
name: paper-reel
description: Make a 9:16 "2.5D paper-cutout collage" explainer reel (vintage paper look, Indian everyday scenes, Gray's-Anatomy X-ray scenes, red slam headlines) from a script + voiceover, using the Remotion kit in this folder. Use when the user gives a topic/script/audio and wants a reel in this style.
---

# paper-reel

The full instructions live in the kit root. Read them in this order and follow them exactly:

1. `AGENTS.md`: the 10-step pipeline and the hard rules.
2. `docs/STYLE.md`: how to direct scenes, metaphors, pacing and the palette.
3. `docs/SCHEMA.md`: every storyboard field, set, layer and prop.
4. `docs/ASSETS.md`: how to write image prompts for cutouts and backgrounds.
5. `public/projects/demo/storyboard.json`: a working example.

Commands (run them from the kit root): `npm run transcribe -- <name>`, `npm run check -- <name>`,
`npm run images -- <name>`, `npm run stills -- <name>`, `npm run render -- <name>`.

The only file you write per video is `public/projects/<name>/storyboard.json`, plus `shotlist.md` and `assets.json`.
Before the final render, look at the stills with the Read tool and fix the problems you see.

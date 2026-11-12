# Image assets — photoreal cutouts and backgrounds

The engine draws sets, anatomy, charts and simple props itself. **Photoreal things** — vehicles, hands, people,
animals, food, monuments, appliances — are real photos, cut out automatically.

## Default route: FREE stock photos + local cutout (`npm run stock -- <name>`)
1. For each cutout in `assets.json` the kit searches Pixabay + Pexels (if free keys are in `.env`) and Openverse (no key).
2. It downloads the top candidates (default 5), removes the background **locally** (no cost, offline model),
   keeps only the main subject, rejects photos where the subject is cut off by the frame, scores them and keeps the best.
3. It colour-grades every cutout (muted, warm, slightly lifted blacks) so photos from different sources match the paper look.
4. It writes `CREDITS.md` (put the CC-licensed credits in the video description) and `assets/_sheet.png` (all chosen cutouts on one sheet).

`npm run images -- <name>` uses this automatically when no paid AI key is configured.

## assets.json
```json
[
  { "file": "assets/auto.png", "kind": "cutout", "query": "auto rickshaw" },
  { "file": "assets/hands_pov.png", "kind": "cutout", "query": "hands raised palms", "allowCut": ["bottom"] },
  { "file": "assets/tiger.png", "kind": "cutout", "query": "bengal tiger walking", "pick": 3 },
  { "file": "assets/tower.png", "kind": "cutout", "url": "https://upload.wikimedia.org/....jpg", "credit": "Photo: X, CC BY-SA 4.0" },
  { "file": "assets/my_photo.png", "kind": "cutout", "source": "manual" }
]
```
| field | meaning |
|---|---|
| `query` | **2–4 plain English words**, the object only ("pressure cooker", "white hatchback car front view"). No style words. Add "isolated" or "white background" when the object is small and common (a cup, a phone) — it finds clean product shots. |
| `allowCut` | Sides where the subject may touch the frame: `["bottom"]` for hands/arms entering from below, `["bottom","left"]`, etc. |
| `pick` | After review, force candidate N (see `assets/_candidates/<name>/NN_score.png`). |
| `url` | Use this exact image (e.g. a Wikimedia photo of a specific landmark). Add `credit`/`license`. |
| `source` | `"manual"` = the user will drop the file in; `"ai"` = generate with a paid AI key; default `"stock"`. |
| `prompt` | Only used for AI generation (`source: "ai"`) — see templates below. |

## Review loop (agent must do this)
1. Open `assets/_sheet.png`. For each bad cutout (cut off, wrong object, two objects, ugly edge):
   look in `assets/_candidates/<name>/`, set `"pick": N`, or change the `query`, then re-run with `--only=<file> --force`.
2. If nothing good exists in stock, replace it with a built-in prop/set, or mark `source: "manual"` and tell the user what photo to add.

## Choosing what to make a cutout (stock-friendly thinking)
- Prefer **common, single objects**: vehicles, animals, appliances, food, plants, tools, monuments.
- For specific *actions* (a hand holding a phone with a notification), combine pieces: a hand photo + the built-in `phone` prop + `notifications` layer.
- People: use a person photo cut out, or the silhouette style (`isotype`). Avoid recognisable celebrities.
- Same object across scenes = same file.

## Optional: AI generation (only if the user has a paid key with billing on)
`source: "ai"` + `prompt`, then `npm run images -- <name> --provider=openai|gemini`. Cutout prompt suffix:
> Photorealistic, isolated on a plain white background, soft studio light from the top-left, slightly desaturated vintage film look, crisp edges, whole object in frame, no text.
Generated images are passed through the same local background removal.

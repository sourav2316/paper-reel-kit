# Storyboard schema — `public/projects/<name>/storyboard.json`

- **Times** are absolute seconds on the voiceover, taken from `transcript.json`.
- **Positions:** `x` and `y` are the **centre** of an element as a fraction of the frame (0–1). `w` is width as a fraction of frame width. The frame is 1080×1920.
- **Paths:** `"assets/auto.png"` is relative to the project folder. `"/sfx/pop.mp3"` is relative to `public/`.

```json
{
  "title": "Why stress makes you sick",
  "audio": "vo.mp3",
  "music": "/music/curious-pizzicato.mp3",   // optional — omitted = kit default, false = none
  "musicVolume": 0.08,                        // optional — default 8%
  "endPadding": 0.6,
  "scenes": [ { ...scene }, ... ]
}
```

## Scene

| field | type | notes |
|---|---|---|
| `id` | string | Unique and readable, e.g. `"hook-street"`. |
| `start`, `end` | seconds | Scenes tile the timeline: each `start` = the previous `end`. |
| `set` | `{ "builtin": SET, "options": {} }` or `{ "image": "assets/bg-x.png", "ambient": "breathe", "variants": [{ "at": 12.4, "image": "assets/bg-x-night.png", "fade": 1.2 }] }` | The background. For an image, `variants` crossfades to the same picture at another time of day (day → sunset → night) at absolute second `at`. |
| `tint` | `normal` `desaturate` `night` `sunset` `calm` `warm` `dark` | Colour grade for the whole scene. |
| `tintChanges` | `[{ "at": 6.2, "tint": "desaturate" }]` | Animated mood shift inside a scene (fades over 0.6 s). |
| `camera` | `{ zoomFrom, zoomTo, focusX, focusY, pushAt, pushTo, shakeAt: [s] }` | Defaults to a slow 1.00→1.04 drift. `pushAt` does a fast push-in to `pushTo` (e.g. 1.6) toward `focusX/Y`. `shakeAt` triggers an impact shake. |
| `transitionIn` | `blur` (default) `scan` `push` `fade` `wipe-left` `cut` | How this scene arrives. `scan` is the glowing X-ray bar that sweeps top→bottom. |
| `transitionDuration` | seconds | Default 0.6 (scan 0.9). |
| `caption` | string | Tiny mono text, top right. Anatomy scenes default to "GRAY'S ANATOMY, 1918". |
| `dark` | bool | Light headline text. Automatic for `anatomy` and `night-city`. |
| `headlines` | Headline[] | See below. |
| `layers` | Layer[] | Drawn in order; later layers sit on top, or use `z`. |

### Built-in sets (`SET`)
| set | what it is | options |
|---|---|---|
| `skyline` | sky, paper clouds, apartment blocks with water tanks, road with zebra crossing | — |
| `street` | sky, upper floors, row of shops with signboards, kerb, road, footpath | `"signs": [{ "text": "SHARMA MEDICAL", "color": "#2F6B4F" }, ...]` (3–5 shops) |
| `balcony` | sky, sun, far city, clothesline with clothes, green railing, ledge | — |
| `anatomy` | dark slate board (add a `body` layer) | — |
| `room` | painted wall, barred window, red floor, striped rug | `"wall": "#8E9F78"` |
| `office` | windows with city, wall with sticky notes, desk | — |
| `kitchen` | yellow wall, plate shelf, window, tiles, counter | — |
| `checker-room` | cream wall, arched railing, checker floor | — |
| `night-city` | stars, moon, dark towers with lit windows | `"lightsOffFrom": 92.0` (windows go dark from that second) |
| `sunrise` | warm sky, pulsing sun, hills, path | — |
| `jungle` | trees, swaying tall grass | — |
| `lab` | pale-green plank wall + floor (data-viz backdrop) | — |
| `corkboard` | lab wall + big corkboard (put `bars`/`note` on it) | — |
| `wood-desk` | top-down wooden desk (CTA ending) | — |
| `showroom` | phone/electronics store: spotlit shelves of boxes, swinging sale banner, glass display counter | `"banner": "NO COST EMI"`, `"banner2": "0% EMI"` (round hanging tag), `"bannerY": 520` |
| `bank` | bank hall: teller windows with signs, LED token board, ceiling fan, clock, counter, rope barrier | `"windows": ["LOANS", "EMI", "CASH"]` |
| `iceberg` | sky + sea: small tip above water, huge hidden mass below (great for "hidden cost / you only see the top"). Tip is at y≈0.33, underwater area y 0.4–0.9 | `"waterline": 720` |
| `bedroom` | night bedroom: window with sky + city, **waving curtain**, lamp, wall clock, bed. Sky time-lapse: `"skyChanges": [{ "at": 23.4, "sky": "day" }, { "at": 24.3, "sky": "dusk" }]` (absolute seconds; the room brightens with daylight) | `"sky": "night"\|"dawn"\|"day"\|"dusk"`, `"light": "phone"\|"lamp"\|"day"\|"dark"`, `"clock": "3:00"`, `"curtain": false` |
| `library` | tall bookshelves, desk lamp, desk (studies, books, research) | — |
| `paper` | plain paper | — |

For any other place (a temple, a hospital, a railway platform…), generate an image background
(`{ "image": "assets/bg-platform.png" }`, kind `background` in assets.json).

## Headline
```json
{ "at": 12.4, "small": "YOUR BODY'S", "big": "ALARM", "bigAt": 12.9, "bigColor": "red", "until": 14.0 }
```
- `small` fades in at `at`. `big` slams in at `bigAt` (default `at + 0.35`).
- Each headline stays until the next one starts, or until `until`.
- `bigColor`: `red` (default), `blue` (calm), `mustard`, `cream`, `ink`.
- `y` moves the block down (default 0.128). Use it only if a prop must sit high.

## Layers — common fields (all optional)
| field | meaning |
|---|---|
| `x`, `y`, `w` | Centre and width (fractions). |
| `at` / `out` | Appear / disappear time (abs seconds). The default `at` is the scene start. |
| `enter` | `pop` (default) `fade` `slide-up` `slide-down` `slide-left` `slide-right` `drop` `zoom-in` `grow-up` `none` |
| `exit` | `fade` (default) `pop` `slide-down` `slide-left` `slide-right` |
| `ambient` | Idle motion: `bob` `sway` `breathe` `jiggle` `vibrate` `spin` `drift` `flicker`. `ambientAmount` scales it. |
| `move` | `{ "toX": 1.3, "toY": 0.7, "toW": 0.8, "at": 3.0, "dur": 2.5, "ease": "linear" | "inOut" | "out" }`. For vehicles crossing, use `linear` and go off-frame (x < -0.3 or > 1.3). For a car coming at the camera, grow `toW`. |
| `rotate`, `flipX`, `opacity`, `z` | Transform and stacking. |
| `shadow` | Soft contact shadow (on by default for images). |
| `glow` | Pulsing orange glow. |
| `sfx`, `sfxVolume` | A sound played at `at` (e.g. `"/sfx/pop.mp3"`). The file must exist. |

## Layer types
| type | extra fields | use for |
|---|---|---|
| `image` | `src`, `blend` (`multiply` hides a white background), `label` | **All photoreal cutouts**: vehicles, hands, people, animals, objects, landmarks. |
| `prop` | `name`, `text`, `color`, `value`, `ringing` | Built-in SVG objects (list below). |
| `cloud` | `variant` 0–2 | An extra paper cloud. |
| `birds` | `count`, `y` | A flock flying across (full frame). |
| `steam` | — | Rising steam; put it just above a cup or cooker (w≈0.1). |
| `rain` | — | Full-frame rain. |
| `flare` | `x`, `y` | A horizontal lens flare flash (use with camera `pushAt`). |
| `burst` | `text` | Comic starburst ("PEEP!", "HONK!", "BOOM!"). Keep it short and use `out`. |
| `bubble` | `text`, `check` | Paper thought bubble, optionally with a self-drawing tick. Without text it's an empty thought cloud to put things in. |
| `note` | `text`, `sub`, `stamp` | Paper document with fake lines and an optional red stamp ("EMI DUE"). |
| `notifications` | `items[]`, `interval` | Notification slips stacking in one by one. |
| `stamp` | `text`, `color` | Rubber stamp that slams down ("CHRONIC", "2–3×"). |
| `mark` | `kind` (`circle` `check` `cross` `underline` `squiggle` `arrow`), `color`, `dur`, `h`, `hand` | A **real hand holding a marker** comes in, draws the mark (the pen tip follows the stroke exactly), and leaves. `hand: false` = mark only. Place it over the thing being marked. To circle a price, prefer the `markAt` / `markFirstAt` / `markLastAt` fields on `price` and `listing` instead; they always land exactly on the number. |
| `counter` | `from`, `to`, `digits`, `suffix`, `dur` | Split-flap number counter (000→394, 47%). |
| `isotype` | `rows`, `cols`, `fill` (percent), `fillColor`, `baseColor`, `dur` | Grid of seated people; `fill`% turn red. |
| `bars` | `values[]`, `labels[]`, `colors[]`, `max`, `dur` | Paper bar chart, bars grow. |
| `ecg` | `dur` | Heartbeat strip drawing itself. |
| `calendar` | `month`, `year`, `crossed` (days crossed out), `flipTo` [months], `dur` | Wall calendar: X marks or month flips. |
| `body` | `zoom` (`full` `head` `torso`), `brain` `lungs` `heart` `stomach` `adrenals` `kidneys` = `hidden`/`line`/`on`/`glow`, `bell`, `ringing`, `switchState` (`off` `on` `broken` `none`), `particles`, `gears`, `calm` | The X-ray anatomy figure. The brain is wired to a brass alarm bell. Use full width: `x 0.5, y 0.6, w 1`. To change state mid-scene, add a second `body` layer with `at`, and give the first one `out` at the same time with `"enter": "none"`. |
| `orbit` | `items[]`, `rx`, `ry` | Labels circling on a dashed ellipse (overthinking loop). |
| `text` | `text`, `size`, `color`, `font` (`display`/`mono`) | Rarely needed; use a label or sign. |
| `price` | `value` ("9,999"), `old`, `prefix` (default ₹), `style` (`tag` swing tag, `card` yellow sticker, `plain` big digits), `label` ("SALE"), `color`, `scan`, `countTo`, `countAt`, `countDur` | Any price. The text auto-fits the layer width. `scan: true` = the brain reads it left→right, then the first digit turns red and the rest fade (great for "first digit" ideas). `countTo: 10000, countAt: 3.3` rolls the number to a new value 3.3 s after it appears. **Marker rings drawn by the hand** (seconds after the layer appears): `markAt` circles the whole number, `markFirstAt` the first digit, `markLastAt` the last two digits ("99"). Options: `markColor`, `hand: false`. |
| `listing` | `title`, `price`, `old`, `off` ("28%"), `rating`, `badge`, `img`, `markAt` | Generic shopping-app product card (no real brand logos — invent product names). Stack 2–3 for "every product costs X". `markAt` = the hand circles the price. |

**One continuous marker hand per scene.** When several things get marked in a row (e.g. three listing prices), the engine automatically chains them: one hand comes in, draws the first mark, **travels** to the next, draws it, and only leaves after the last one. To chain, start each mark 0.0–0.8 s after the previous stroke finishes (a ring stroke takes ~0.6 s, a `mark` takes 0.2 s + `dur`). Example: `markAt` at 5.3 / 6.05 / 6.8 seconds (absolute). A bigger gap means the hand leaves and comes back. `npm run check` warns if two marks would be drawn at the same time.
| `chat` | `name`, `messages: [{ from: "me"|"them", text, at }]`, `interval` | A phone with a generic messenger. `at` = seconds after the layer appears. "them" messages get a typing indicator first. Write the text in Roman Hinglish/English. |
| `newspaper` | `headline`, `sub`, `date`, `masthead` (fictional, default "THE DAILY KHABAR"), `markAt` | Old newspaper clipping for "in 2013 X said…" facts. `markAt` = the hand circles the headline. Never imitate a real newspaper's name or logo. |
| `balance` | `left: {label, value, weight}`, `right: {…}`, `rightAt`, `leftColor`, `rightColor` | Taraazu / balance scale. The left pan loads first (tips left), the right pan lands at `rightAt` (seconds after appear) and the beam swings level (equal weights) or tips. Use for "equal / cancels out / which is heavier". |
| `figure` | `pose` (`stand` `walk` `slump` `stretch` `sit-phone` `sit-desk` `lie-phone` `sleep` `lie-awake`), `style` (`paper` default / `silhouette`), `shirt`, `pants`, `skin`, `hair`, `blanket` | **A person.** Paper-cutout human (clothes, face, white cut border, shadow), with breathing/idle motion; `walk` animates the legs (combine with `move`). Lying poses fit on the `bedroom` bed at `x 0.62, y 0.79, w 0.82`. Keep the same shirt colour for the same character across scenes ("you" = one person). Typical w: standing 0.3–0.45, sitting 0.4–0.6. |
| `reelfeed` | `from`, `to`, `interval`, `label` | Phone showing an endless reels feed that swipes every `interval` s, with a "REEL #n" counter. |
| `receipt` | `items: [{ label, price }]`, `budget`, `interval`, `stamp`, `title` | Paper bill: items print one by one, the total counts up, and an OVER BUDGET stamp slams down if the total beats `budget`. |

### Built-in props (`prop.name`)
`alarm-clock` (ringing), `phone` (text; notifications pop in), `chai`, `battery` (value 0–4, or it fills over 1.6 s; `text: "2%"` prints a label, red when value ≤ 1),
`stopwatch`, `book` (open book, text on right page), `charger` (phone on a charging dock), `qr-stand` (UPI scan-and-pay stand, text = label), `bell` (ringing), `switch` (text ON/OFF), `lightbulb`, `question`, `exclaim`, `heart-icon`, `moon`, `sun`,
`shield` (outline draws itself — make it big, w≈0.8), `pen`, `coffee` (top-down), `glasses`, `ladder`, `paper`, `pole`, `plant`.

## Sizes that work (w)
Auto rickshaw 0.4 · car (side) 0.45 · car (front, close) 0.7→1.1 · bus 0.8 · POV hands 0.9 · hand with phone 0.45 ·
person 0.35 · tiger 0.6 · cup 0.13 · plant 0.2 · alarm clock 0.15–0.3 · bubble 0.55–0.95 · note 0.3–0.6 · counter 0.4 · isotype 0.8.

### Animated illustrations
Layer type `motion` uses the standard placement and timing fields (`x`, `y`, `w`, `at`, `move`, etc.). Choose a `kind`:
- `shield`, `particle`, `entry` (cross-section), `route` (guided anatomical diagram), `brain`
- `stream` (running water), `foliage`, `light`, `ball`, `pulse`
- `week` (seven date cards) or `year` (twelve month cards)

Optional `dur` controls the time to fully reveal a progressive illustration (default 2.5 seconds).
Use `tone: "deep"` for a deeper cut in `entry`, or a CSS color for the `pulse` stroke and glow.
A `text` layer can use `backplate: true` for a compact, dark paper label.

A `text` layer can align text with `align: "left" | "center" | "right"`. Newlines are preserved.
A `written-card` draws uppercase Latin text using the photographic marker at `hand`. Each entry in `rows` uses `text`, a start `at` relative to the layer, and `dur`. Rows must be sequential and should leave at least 0.26 seconds for the hand to travel between them.
A `clinical` layer supports `kind: "monitor" | "prohibit" | "anatomy-travel"`. On the monitor, `dur` sets the moment of the flatline relative to layer entrance. Anatomy travel uses a registered anatomical illustration in `src` and `dur` for the guided zoom.
Optional written-card fields: `textScale` scales the handwriting (default 1) and `rowSpacing` sets line spacing in paper coordinates (default 105).
An `atmosphere` layer adds `kind: "night-window" | "lamplight" | "breath" | "signal"`, with optional `tone` and `dim` (for the signal indicator). Position with the common layer fields.
Use `anchor: "top"` for a hanging layer such as a curtain, so it sways around its upper edge.
A `snow` layer adds wind-driven flakes over the frame. Optional fields are `density` (1–120), `speed`, `near` (larger flakes), `opacity` and `z` for stacking.

Use transparent PNG image layers for moving foreground elements. Animate them with `move` and `ambient`; keep the background plate intact.
An `action` layer adds a timed `kind` of `torch`, `powder`, `radar`, `breath`, `flame`, `depth`, `radio`, or `rotor`. Use scene layer placement and `at` as usual.

An `articulated-cutout` layer animates cropped parts of a transparent image. Set `src`, the source `ratio` (width divided by height), and ordered `parts`. Each part uses an SVG `outline` in 0–100 source coordinates. Optional `pivot` [x, y] and sorted `poses` [local seconds, degrees] rotate each piece. A part can carry nested `children` and a `light` with `tip` [x, y], `angle`, `reach` and `spread`. Draw stationary pieces first. Overlap crops near the joints so they stay connected when rotated.

Use optional camera `focusToX` and `focusToY` to ease the zoom origin between two subjects during a shot. An articulated part can use `shifts` [local seconds, x, y] in source coordinates and `folds` [local seconds, scaleX] on its pivot for hinged flat objects. A `trace` layer draws a full-stage SVG `path` in 0–100 coordinates starting at `at` over `seconds`. Optional `style: "air"` adds traveling particles. Set `tone`, `weight`, and `opacity` to suit the scene.

Use a `cloth-flag` layer with a 3:2 PNG `src` and optional `wind` (0–1.5) to animate the flag around a fixed pole. Use `light.lens: true` on an articulated torch part to draw a small practical light at the same tip that emits the beam.

Set `paperCreases: false` at storyboard level to remove the three full-frame fold lines. Paper grain, vignette and the headline rule stay in the overlay.

The `layered-paper-stage` built-in set composites paper scenery and moving environmental layers. Choose `options.location` from `yard`, `ritual`, `bedside`, `clinic`, `stable`, or `board`; add `options.dawn: true` for sunrise. Use `paper-diagram` for paper props with intrinsic motion. Choose `kind` from `globe`, `count`, `species`, `fang`, `pulse`, `clock`, `blocked`, `eye`, `breathing`, `antibodies`, `route`, or `prompt`. The count uses `value`, and `mode` selects the focus or state where supported.

Use `ribbon-cutout` for a long transparent PNG that bends as it moves. Set `src`, `ratio` (source width divided by height), and optional `amplitude` from 0 to 8. The right-hand end stays rigid. Set `move` for forward motion.

Camera `keyframes` define a continuous move within the same set. Each key uses scene-local `at` (seconds), `zoom` (at least 1), and normalized subject coordinates `x` and `y`. The viewport follows the subject with eased motion bounded by the plate edges. Add `screenSpace: true` to a label layer when it should stay in a fixed screen position during the move.

An articulated part can emit moving particles from a local `trail` with a `tip` [x, y], a `drift` [dx, dy], and a color `tone`. The emitter follows the same part transforms as the artwork.

### Background motion, focus transitions and object poses

- An image set accepts `motion: "sunlight" | "plaque" | "specimen" | "clinic"` for anchored illumination and moving particles behind the interactive layers. Add the location's separate practical cutouts or effects on top.
- Set `transitionIn: "travel"` with `transitionFocus: {x, y}` in screen fractions to match the focus point across adjacent shots. The outgoing world advances around that point while the incoming world settles into frame. Existing transition names remain available.
- To choreograph a prop through multiple positions, use `keyframes` on the layer, with ordered entries `{at, x, y, w, rotate?, opacity?}`. Here `at` is an absolute voiceover time, and positions are normalized (offscreen entry is allowed). Poses interpolate continuously. Use identical contact poses for both versions of a prop when an occlusion or grip pose changes.
- Set `rooted: true` on a `ribbon-cutout` to hold its left end steady while the rest flexes. Use layer keyframes to position that end on its physical origin during the animated reveal.

A written-card layer accepts a measured handTip [x, y] in normalized sprite coordinates. With an explicit nib anchor, the pen also lifts during travel between ink strokes.
A water-flow layer takes normalized source and target pairs for the faucet outlet and basin impact, plus an optional width in composition pixels. The stream, splash and ripples follow that same world-space placement.

### Angithi scene layers

The Angithi V2 storyboard uses a full-stage `angithi-world` layer with a scene `mode`, an `art` map of asset paths and absolute voiceover `cues`. The closure points and camera poses are calibrated to its assets. A `travel` transition with `transitionAperture: true` reveals the incoming scene around the shared `transitionFocus` point in screen coordinates.

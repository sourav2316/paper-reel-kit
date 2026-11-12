# Style bible — how to direct a paper-reel

## The look in one paragraph
A vintage folded paper poster has come alive. Photoreal cutouts of real Indian everyday things (auto rickshaws,
chai glasses, pressure cookers, hands, phones, a clock tower) sit on flat, muted, hand-made-looking sets. Paper
clouds drift by. For "inside the body / mind" moments, a glowing scan bar reveals a dark *Gray's Anatomy 1918*
board, where a white line-art body has glowing organs and a brass alarm bell is wired to the brain. Big condensed
red headlines slam in at the top-left, one or two words at a time, in sync with the voice. Nothing is ever still.

## Palette (already in the theme; don't use others)
sky `#A9C4C9` · paper `#EFE6D2` · brick red `#C0392B` (headlines, accents) · mustard `#E3B23C` · slate `#1F2A2C` (anatomy) · ink `#2B2B2B` · calm blue `#8FB3D9` (only for the "calm / healed" beat) · sage `#B9C6A3` (data-viz wall).

## Story structure (adapt it to any topic)
| beat | share of runtime | visual |
|---|---|---|
| 1. Hook | 0–5 s | A relatable, noisy everyday scene, then one huge word (the topic). Add a second line that speaks to the viewer ("YOU'VE FELT IT"). |
| 2. Question / twist | ~3 s | The same set desaturates (`tintChanges`) and a "?" pops. |
| 3. "Looks fine…" | ~4 s | A calm scene and a thought bubble ("ALL GOOD ✓"). |
| 4. "…but inside" | ~3 s | `scan` transition to `anatomy`. The bell starts ringing. |
| 5. Analogy | 8–12 s | A concrete everyday example (a car coming fast → hands jump back) on a home set. |
| 6. Mechanism | 15–25 s | One step = one visual metaphor on the anatomy board: organ glow, particles, battery filling, push-in + flare. |
| 7. History / evolution | ~8 s | Jungle POV, cave painting, then a **morph** back to the modern city. |
| 8. Modern problem | 15–20 s | Office desk piling up, calendar flipping months, alarm with a cobweb, night tower with one light on. |
| 9. Symptoms montage | 10–15 s | 1.5–2 s per symptom, each in its own small set (kitchen, room, stomach on the board). |
| 10. Proof | 10–15 s | One real study as data viz: counter → isotype grid → bar chart → stamp. |
| 11. Hope / solution | ~10 s | `sunrise`, a meditation POV, a calm blue brain, "do small things slowly". |
| 12. CTA | 3–4 s | `wood-desk` with a note card; a pen squiggles; "TELL US IN THE COMMENTS". |

For a 60 s reel, keep beats 1, 4, 5, 6, 8, 10 and 12, and shorten each.

## Directing rules
1. **One idea = one picture.** Turn every abstract word into a physical metaphor: stress = an alarm bell;
   energy = a battery; worries = paper slips and documents; overthinking = items orbiting in a thought cloud;
   "for months" = calendar pages flipping; chronic = an alarm with a cobweb; danger = a car rushing at the camera.
2. **Indian specificity.** Use auto rickshaws, chai in a glass, tulsi, a lota, pressure cookers, EMI notices,
   family WhatsApp groups, board exams, shop signboards like "SHARMA MEDICAL" and "RAJU CHAI CORNER".
3. **Home sets.** Pick 3–4 sets and keep coming back to them (street → anatomy → street → anatomy → room → street).
   Add or remove props instead of changing the set.
4. **Beat every ~1.5–2 s:** a headline change, a pop, a mark, a camera push or a crossing vehicle.
5. **Headlines are keywords, not subtitles.** `small` sets up the idea and `big` delivers the punch. Example:
   VO "Your body's alarm goes off" → `small: "YOUR BODY'S"`, `big: "ALARM"`.
6. **Motion grammar.** Things enter with overshoot (`pop`, `drop`, `slide-up` for hands and phones). Vehicles
   cross with `move` + `linear`. Push in on the subject of the sentence. Shake on impacts. Draw marks on what
   the VO is pointing at.
7. **Layering for depth:** background set → far props → main cutout → foreground objects (a pole or hands near
   the camera, w > 0.8) → bursts and marks → headline.
8. **Transitions.** Use `scan` only for "going inside" (2–4 times per video). Use `blur` as the default and
   `push` for emphasis. Inside one set, use `tintChanges` instead of a cut.
9. **Leave room.** The top 12–26% belongs to the headline. Put props below y ≈ 0.3, or nudge the headline `y`.

## Recipes (copy and adapt)
- **Car rushing at the camera:** `image car_front.png` with `x .5 y .7 w .3`, `move { toW: 1.1, toY: .82, dur: 1.2, ease: "inOut" }`, plus a `burst "PEEEP!"` and camera `shakeAt`. Then `image hands_pov.png` with `enter: "slide-up"`, `w .95, y .85`.
- **Alarm in the brain:** `anatomy` + `body { bell: true, ringing: true, brain: "glow" }` + camera `pushAt` toward `focusY .17`, `pushTo 1.7` + a `flare` 0.3 s later.
- **Hormone rush:** `body { zoom: "torso", adrenals: "glow", particles: true }` + `prop battery` beside it.
- **Overthinking:** `room` + an empty `bubble` (w .95) + `orbit` with the worries + `prop alarm-clock ringing`.
- **Months passing:** `calendar { flipTo: ["FEBRUARY", "MAY", "SEPTEMBER"] }` + headline "FOR MONTHS".
- **Chronic:** `night-city { lightsOffFrom: t }` + `stamp "CHRONIC"`.
- **Study:** `lab` + `counter 000→N` + silhouette cutouts → `isotype fill: X` + `counter X%` → `corkboard` + `bars` + `stamp "2–3×"`.
- **Calm ending:** `sunrise` + `body { calm: true }` with `bigColor: "blue"`.
- **Money / pricing topics:** `paper` + 3 stacked `listing` cards → `corkboard` + swing `price` tags → `anatomy` (`zoom: "head"`) + `price { style: "plain", scan: true }` → `wood-desk` + `receipt` with `budget`. A worked example is `public/projects/price-99/storyboard.json`.
- **"That friend who…":** `room` + `chat` (a long "me" message, then a short lazy reply).

## Language
For Hindi or Hinglish voiceovers, write headlines in **Roman Hinglish caps** ("DIMAAG KE LIYE", "BUDGET GAYA TEL LENE!"). The display font has no Devanagari. The ₹ symbol works.

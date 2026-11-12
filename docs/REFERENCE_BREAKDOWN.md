# Paper-Collage Explainer Reels — pura breakdown + master prompt

Reference video: 720×1280 (9:16) · 30fps · 2:27 · ek hi continuous flow, koi hard cut nahi.

---

## 1. Ye video kya kehlati hai

**"2.5D paper-cutout collage explainer"**, jise **mixed-media motion graphics explainer** bhi kehte hain. Isme teen layers milti hain:
- **Photoreal cutouts**: clock tower, auto, bus, car, haath, phone, tiger, pressure cooker, tulsi. Ye asli photo jaise transparent PNG hain.
- **Flat vintage illustration**: buildings, kamre, calendar, charts, clouds (paper-cut style, white outline aur soft shadow ke saath).
- **"Gray's Anatomy 1918" X-ray scenes**: dark slate background, white line-art body, sepia engraving-style organs jo glow karte hain.

Upar se **folded-poster overlay** lagta hai: crease lines, paper grain, vignette, left edge pe punch dots, aur top pe ek thin rule line. Isi overlay ki wajah se sab "ek hi kaagaz pe chal raha hai" jaisa lagta hai.

Ye **code se banti hai** (React/HTML + animation), video-AI (Sora/Veo) se nahi. Isi liye text itna crisp hai, motion itna controlled hai, aur same scene mein elements aate-jaate rehte hain.

---

## 2. Scene-by-scene breakdown

| Time | Scene | Kya animate hota hai |
|---|---|---|
| 0–5s | Chowk + clock tower | Auto drive, bus enter, cars loop. "PEEP!"/"HONK!" comic starbursts pop + wobble. Birds udte hain, clouds drift karte hain. "STRESS" slam-in. Neeche se haath+phone slide-up hota hai, notification slips ("EMI DUE TODAY", "FAMILY GROUP · 12 NEW") stack hote hain. "YOU'VE FELT IT". |
| 6–7s | Same chowk | Scene desaturate + dark ho jaata hai. "CHRONIC STRESS?" ke saath red "?" bounce karta hai. |
| 8–14s | Balcony (chai, kapde, patang, kabootar, tulsi) | Chai se steam, patang sway, kapde hilte hain, sun glow. Thought bubble "ALL GOOD", aur tick khud draw hota hai. |
| 14–16s | **Scan-line wipe** | Glowing horizontal light bar upar se neeche jaata hai (X-ray scanner jaisa) aur peeche dark anatomy reveal hoti hai. "BUT INSIDE…" — brain → wire → brass alarm bell vibrate. |
| 17–28s | Market street (Sharma Medical, Raju Chai Corner) | Auto pass hota hai, pole foreground parallax. Car samne aati hai, scale-up zoom, "PEEEP!". POV haath "YOU JUMP BACK". "THAT'S STRESS". |
| 29–40s | X-ray | Brain/bell pe push-in + lens flare: "DANGER TO THE BRAIN". Adrenal glands highlight, particles flow karte hain: "FIRST ADRENALINE", "THEN CORTISOL" (battery 0→4 bars). |
| 41–51s | Street / heart / microscope | Red marker circles draw hote hain: "FULLY ALERT". Heart + ECG line draw. Microscope circle mein immune cells jiggle, stopwatch: "IMMUNITY BOOSTED". "BACK TO NORMAL". |
| 52–66s | Defence shield → jungle | Shield outline draw. POV bhaala pakda haath, tiger cutout leap. Bhimbetka cave art "SINCE ANCIENT TIMES". Jungle **morph** hoke apartment ban jaata hai, haath same rehta hai: "TODAY'S LIFESTYLE". |
| 67–70s | Bell + switch | Switch "OFF" toot ke girta hai: "THE SWITCH BREAKS". |
| 71–78s | Office desk → street | Items ek-ek land hote hain (EMI DUE paper, boss ka haath, exam ✓✗, ladder, phone 12). Word list "EMI · BOSS · EXAMS · CAREER · & MORE". Sunset street pe sab pada hai: "THEY NEVER LEAVE". |
| 79–89s | Room, alarm clock | Thought bubble mein items dashed ellipse pe orbit: "OVERTHINKING". Items brain mein: "CARRIED EVERYWHERE". Calendar pages flip Jan→Sep: "RINGING FOR MONTHS". Battery: "ALWAYS ON". |
| 90–98s | Night building | Windows ek-ek karke bujhti hain, ek jalti rehti hai, "CHRONIC" rubber stamp. Alarm pe makdi ka jaala: "AN ALARM THAT FORGOT TO STOP". Brain mein gears + sparkles. |
| 99–111s | Symptoms montage | Lota se paani "RUSHING EVERYTHING", nervous haath "ANXIETY", pressure cooker steam "ANGER, FORGETTING", fan blur "SLEEP", stomach knot, BP needle, icons ring "ALL OF THIS CAN HAPPEN". |
| 112–129s | Study / data viz | "Common Cold Unit" barrack, baarish. Split-flap counter 000→394, silhouettes pop. Nose diagram + dropper "ON PURPOSE". Isotype grid red fill, counter 27% / 47%. Calendar X marks. Bar chart grow + "2–3×" stamp. |
| 130–143s | Solution | Sunrise valley, sun pulse "IT CAN BE REDUCED". Meditation POV. Brain blue "CALM". Tulsi "DO SMALL THINGS SLOWLY". Street "IT'S PART OF LIFE NOW". |
| 144–147s | CTA | Wooden desk, chai, chashma, "MY STRESS IS:" card, pen squiggle draw. "TELL US IN THE COMMENTS". |

**Har scene mein jo repeat hota hai:**
1. **Background kabhi still nahi hota**: clouds drift, birds, steam, sway, halka "breathing" zoom.
2. **Home sets reuse hote hain**: chowk, street, X-ray body aur kamra baar-baar wapas aate hain, naye props ke saath.
3. **Text system**: chhoti dark line pehle aati hai, phir badi red line slam-in. Left-top pe, har 1.5–3s mein badalta hai, voiceover ke saath sync.
4. **Transitions**: scan wipe, blur dissolve, desaturate, morph, push-in.
5. **Easing**: sab spring/overshoot hai, linear kuch nahi.
6. **Palette**: sky `#A9C4C9`, paper `#EFE6D2`, brick red `#C0392B`, mustard `#E3B23C`, slate `#1F2A2C`, ink `#2B2B2B`.

---

## 3. Kya-kya chahiye

| Cheez | Kaun | Tool |
|---|---|---|
| Script | Claude | — |
| Voiceover | Voice AI | **ElevenLabs** (word timestamps bhi deta hai) |
| **Photoreal cutouts** | **Image AI**. Claude ye photoreal images khud nahi bana sakta | Nano Banana / GPT-Image / Flux / Midjourney, phir `rembg` se background hatao |
| Flat illustrations, body, charts, icons | Claude | SVG code |
| Animation + MP4 render | Claude (code) | **Remotion** (React → MP4) |
| SFX + music | Tu | Pixabay / freesound (royalty-free) |
| System | Node.js ✅, ffmpeg ✅ (dono tere PC pe already hain) | — |

**Plugin/skill?** Zaroori nahi hai. Par channel pe bahut videos banani hain, to ek **custom skill** banana worth it hai. Usme style guide, palette, components aur transitions save rahenge, aur nayi video sirf "topic + VO" dene se ban jaayegi.

---

## 4. MASTER PROMPT (Claude Code mein paste kar)

```
You are building a vertical 9:16 (1080x1920, 30fps) explainer reel using Remotion (React + TypeScript).
Topic: <<TOPIC>>
Length: ~<<90–150>> seconds. Voiceover: public/vo.mp3 with word timestamps in public/vo.json (ElevenLabs format).
Photoreal transparent PNG cutouts are in public/assets/ (<<list files>>).

=== VISUAL STYLE (follow exactly) ===
"2.5D paper-cutout collage" — Indian everyday life + vintage anatomy textbook.
1. Mixed media: photoreal PNG cutouts (with soft contact shadows) on flat, muted, vintage-illustrated SVG
   backgrounds. Clouds = paper cutouts: cream fill, 6px white outline, soft drop shadow, subtle noise.
2. Global <PaperOverlay/> on EVERY frame (top layer):
   - paper grain via SVG feTurbulence (opacity 0.08), seed changes every 2 frames (film flicker)
   - folded-poster creases: vertical at 63% width, horizontal at 33% and 66% height
     (1px highlight + 1px shadow, opacity 0.15)
   - warm vignette + slight sepia (sepia(0.15) contrast(1.05))
   - thin 1px ink rule across the top at y=13%, small punched dots along the left edge
   - tiny monospace caption top-right on anatomy scenes: "GRAY'S ANATOMY, 1918"
3. Palette: sky #A9C4C9, paper #EFE6D2, brick red #C0392B, mustard #E3B23C, slate #1F2A2C, ink #2B2B2B, calm blue #8FB3D9.
4. Anatomy scenes: slate bg with soft radial light, white 2px line-art human silhouette (SVG), organs in sepia
   engraving style; active organs glow orange. A brass alarm bell wired to the brain = recurring stress metaphor.
5. Typography: "Anton" or "Bebas Neue". Headline block top-left (x=6%, y=14%).
   Line 1 small ink 64px fades in first; line 2 big brick-red 150px slams in on the stressed VO word
   (spring scale 1.3→1, blur→sharp). Change text every 1.5–3s from vo.json. No centered text, no bottom subtitles.

=== MOTION RULES ===
- Nothing is ever static: cloud drift, birds, steam (animated SVG paths), cloth/leaf sway (sine ±2°),
  camera "breathing" scale 1.00→1.03 per scene.
- Entrances: spring() with overshoot (damping ~12) — pop, slide-up, drop-bounce. Exits: fast fade + scale 0.9.
- Comic SFX bursts ("PEEP!", "HONK!"): yellow starburst SVG, red text, pop + wobble, 0.6s life.
- Vehicles cross with parallax (foreground faster); poles/props on a front layer.
- Hand-drawn marks (circles, ticks, X's, pen squiggles, ECG) via stroke-dashoffset.
- Numbers use split-flap counters (000→394, 0%→47%).
- Push-in zooms toward the subject of each sentence; 3-frame shake on impacts.
- Build 3–4 "home sets" and keep returning to them with new props — continuity is key.

=== TRANSITIONS (rotate) ===
a) X-ray scan wipe: glowing horizontal light bar sweeps top→bottom in 0.8s, next scene revealed above it (clip-path).
b) Blur dissolve (0→12px out, 12→0 in).
c) Desaturate + darken before a "but…" beat.
d) Morph: foreground (hands/spear/phone) stays fixed while background crossfades to a new world.
e) Push into an object (brain, window) and emerge in the next scene.

=== STORY STRUCTURE ===
Relatable Indian-chaos hook (0–5s) → question → everyday analogy → "but inside…" anatomy → mechanism, one
visual metaphor per step → history/evolution beat → why modern life breaks it → symptoms montage → one real
study as data viz (counter, isotype grid, bar chart, rubber stamp) → solution in warm sunrise palette →
CTA on a wooden desk ("Tell us in the comments").

=== DELIVERABLES ===
1. First write a shot list table (time, VO line, set, props, animation, transition) and show it to me.
2. Implement src/components/{PaperOverlay,Headline,Cloud,Starburst,XRayBody,AlarmBell,ScanWipe,SplitFlap,Isotype}.tsx,
   src/scenes/*.tsx and src/Video.tsx with <Sequence>s, all timings from vo.json.
3. Draw every non-photoreal element as inline SVG. For any missing photoreal asset, list it with an
   image-generation prompt instead of faking it.
4. SFX on pops/honks/bells/whooshes (public/sfx/*.mp3); music ducked under the VO.
5. Render with: npx remotion render Video out/video.mp4 --codec h264 --crf 18. Then export stills every 2s,
   review them yourself for text overlap, static/empty frames and off-palette colours, fix and re-render.
```

---

## 5. Image prompt template (cutouts ke liye)

```
Photorealistic <<OBJECT, e.g. "yellow-black Indian auto rickshaw, side view, driver inside">>,
isolated on plain white background, soft light from top-left, slightly desaturated vintage film look,
muted warm tones, full object in frame, no text, product-photo style.
```
Background hatane ke liye: `pip install rembg` → `rembg i input.png output.png`

---

## 6. Har video ka workflow

1. Claude se script likhwao (chhoti punchy lines).
2. ElevenLabs se VO banao aur timestamps download karo.
3. Claude se asset list + image prompts lo → images generate karo → `rembg` → `public/assets/`.
4. Master prompt do → shot list approve karo → render karo.
5. 2–3 rounds feedback → final.

Pehli video mein 2–4 din lagenge, kyunki components banne hain. Uske baad wahi components reuse honge aur har nayi video kuch ghanton mein ban jaayegi.

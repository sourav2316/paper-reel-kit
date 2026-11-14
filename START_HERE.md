# START HERE — Paper-Reel Kit (ghar ke liye guide)

Ye folder ek **video factory** hai. Paper style, animations, transitions, marker wala haath, paper-cutout insaan,
music aur timing, sab code mein pehle se bana hai. AI (Codex / Claude) ko har video ke liye bas script + audio padhke
`storyboard.json` likhni hoti hai, images banani hoti hain, aur render karna hota hai. Iske saare rules `AGENTS.md` mein likhe hain.

---

## 1. Ek baar setup (10–15 min)

1. **Node.js (LTS)** install karo: https://nodejs.org
2. Zip ko kisi bhi jagah extract karo, jaise `D:\paper-reel-kit`.
3. Us folder mein terminal kholo aur chalao:
   ```bash
   npm install
   ```
   Pehli baar 3–5 minute lagenge.
4. Test karo (30 sec ki demo video banegi `out\demo.mp4` mein):
   ```bash
   npm run render -- demo
   ```

`.env` file mein tumhari keys hain. Ye zip sirf tumhare liye hai, ise kisi ko mat dena.

---

## 2. Har nayi video — sirf ye karna hai

1. Audio file is folder mein daalo (jaise `D:\paper-reel-kit\meri-audio.mp3`).
2. Folder ko **Codex** mein kholo (ChatGPT ke Codex app/IDE/CLI mein, isi folder ko project banake).
3. Ye message paste karo:

```
Read AGENTS.md and follow the full pipeline end to end without stopping.
Project name: <chhota-naam, jaise sleep-debt>
Audio: <file ka naam, jaise meri-audio.mp3>  (language: hindi)
Script:
<poori script yahan paste karo>

Make all images yourself with your image tool (route A in AGENTS.md); if you can't, use route B, then route C.
Every scene must fit this script's world, with a person in most scenes and a new scene every 2–5 seconds.
Check the stills yourself, fix problems, then render the final video.
```

4. Video `out\<naam>.mp4` mein milegi.

**Thumbnail:** kit nahi banati. Wo ChatGPT se alag banwa lena.

---

## 3. Images kaise banti hain (3 raaste, AI khud chunta hai)

| Raasta | Kab | Kharcha |
|---|---|---|
| **A: Codex/ChatGPT ka apna image tool** | Agar Codex khud images bana pa raha hai, jaisa tumne dekha hai. Wo khud prompt likhega, background aur insaan ki images banayega, din→raat ke versions bhi. | Subscription mein |
| **B: API key** (`.env` mein Gemini/OpenAI) | Jab key pe billing on ho. `npm run images` sab bana deta hai. | ~₹5 per image |
| **C: Free** | Upar ke dono na chalein. Free stock photos (gaadi, khana, phone, jaanwar) + kit ke apne sets (bedroom, bank, showroom, library…) + paper-cutout insaan. | ₹0 |

Raasta A ya B se video reference jaisi "painting wali" cinematic lagegi. Raasta C se hamari ab tak wali videos jaisi
(paper style, saaf, animated) banegi.

---

## 4. Agar video mein kuch galat lage

Codex ko seedha bolo, jaise:
- "scene 4 mein insaan bada karo", "ye wala marker 9 ke upar lagao"
- "is topic ke hisaab se naya set banao, sadak mat dikhao"
- "music 6% pe karo", "scene jaldi badlo"

Wo `storyboard.json` badlega, stills check karega aur dobara render karega.

---

## 5. Useful commands

| command | kya karta hai |
|---|---|
| `npm run transcribe -- <naam> --lang=hi` | audio ki timing (sentences + `speech_segments.txt`) |
| `npm run check -- <naam>` | galtiyan aur missing images batata hai |
| `npm run images -- <naam>` | API key se images banata hai (raasta B) |
| `npm run stock -- <naam>` | free stock photos + automatic cutout (raasta C) |
| `npm run cutout -- <naam>` | ChatGPT/Codex ki white-background images ka background hataata hai |
| `npm run stills -- <naam>` | har second ki photo, review ke liye |
| `npm run render -- <naam>` | final 1080×1920 MP4 |
| `npm run studio` | browser mein live preview |

## Folder map
```
AGENTS.md            ← AI ke liye saare rules (Codex + Claude)
docs/                ← STYLE (direction), SCHEMA (har cheez), ASSETS (images)
public/projects/     ← har video ka folder; price-99, no-cost-emi, revenge-bedtime = examples
public/music/        ← default background music (8% pe)
public/hands/        ← marker wala haath
src/                 ← style engine
.env                 ← tumhari keys
out/                 ← final videos
```

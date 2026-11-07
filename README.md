# Lyria Camera: turn your camera into an instrument 🎥🎶

A 45-minute DevFest workshop. You'll build a web app that looks through your camera,
asks **Gemini** what the scene sounds like, and streams live, evolving music from
**Lyria RealTime** that follows whatever you point it at.

```
camera frame ──▶ Gemini 3.5 Flash-Lite ──▶ ["warm lo-fi piano", "rainy window", ...]
                                                       │
                     🔊 speakers ◀── audio chunks ◀── Lyria RealTime (setWeightedPrompts)
                                                       ▲
                          every 20s: new frame ────────┘
```

## Before the workshop (please do this at home!)

No npm, no build step. Just plain HTML + JavaScript.

1. You need **git**, **Python 3** (just to serve the files) and **Chrome or Edge**.
2. Get a Gemini API key at <https://aistudio.google.com/apikey>.
3. Clone and start the local server:
   ```bash
   git clone <REPO_URL> lyria-workshop
   cd lyria-workshop
   python3 serve.py        # Windows: py serve.py
   ```
4. Open <http://localhost:8000>, paste your API key and allow camera access. Press Start:
   you should see **"TODO Step 1: implement imageToMusicPrompts()"**. That means you're ready.
5. Bring **headphones**. 50 laptops playing music at once is not a vibe.

> No Python? Use the VS Code **Live Server** extension or `npx serve`. Any static file server
> works, but you must open the page through `http://localhost` (not by double-clicking
> `index.html`), or the camera and JavaScript modules won't load.

## Project tour

| File | What it does | You edit it? |
|---|---|---|
| `src/config.js` | Models, capture interval, the system prompt | Step 3 |
| `src/gemini.js` | Image → music prompts | **Step 1** |
| `src/music.js` | Lyria RealTime session | **Step 2** |
| `src/main.js` | UI and the capture loop | **Step 3** |
| `src/camera.js` | Webcam + snapshot | No |
| `src/audio_player.js` | Plays raw PCM audio from Lyria | No |
| `src/api_key.js` | Saves your key in this browser | No |
| `index.html` | The page; loads the Gemini SDK from a CDN | No |

Look for `TODO(step N)` comments. The app tells you which step is missing. After editing a
file, just refresh the browser.

## Step 1: Gemini sees the scene (≈10 min)

Open `src/gemini.js` and implement `imageToMusicPrompts()`.

- Send the image (`inlineData`) **and** the `SYSTEM_PROMPT` text to `VISION_MODEL`.
- Use **structured output** (`responseMimeType: "application/json"` + `responseSchema`)
  so you get back `{ "prompts": [...] }` reliably, not free text you'd have to parse.

✅ **Done when:** pressing Start shows 3 prompts in the side panel, then the app asks for step 2.

## Step 2: Lyria makes music (≈12 min)

Open `src/music.js`.

1. **2a** In `start()`, connect with `ai.live.music.connect(...)`, then in `handleMessage()`
   send each audio chunk to `this.player.enqueue(chunk.data)`.
2. **2b** Implement `setPrompts()` with `session.setWeightedPrompts(...)`.
3. **2c** Call `session.play()`.

Key idea: Lyria RealTime is a **stream**, not a request/response API. You open a WebSocket
session once, and it keeps sending ~2 seconds of audio at a time. You steer it by sending
new weighted prompts whenever you like.

✅ **Done when:** you hear music matching the prompts within a few seconds.

## Step 3: Close the loop, make it yours (≈8 min)

1. In `src/main.js`, implement `startLoop()`: every `CAPTURE_INTERVAL_MS`, capture a frame,
   get new prompts, call `music.setPrompts(prompts)`. Point the camera somewhere else and listen.
2. In `src/config.js`, rewrite `SYSTEM_PROMPT`. Ideas:
   - "Always answer as 1980s synthwave"
   - "Describe the music as Indonesian gamelan fusion"
   - "Match the colors: warm colors → major key, cool colors → minor"

✅ **Done when:** the music changes as you move the camera.

## Stretch goals

- **Smooth transitions:** compare with the `bonus-crossfade` branch, which fades old prompts
  out and new ones in by ramping the weights.
- **Shape the sound:** `session.setMusicGenerationConfig({ musicGenerationConfig: { density, brightness, guidance, muteDrums, ... } })`.
  Changing `bpm` or `scale` also needs `session.resetContext()`.
- **Mix in a fixed prompt:** always add `{ text: "upbeat", weight: 0.5 }`.

## Stuck? Jump ahead

Each step's finished code is on its own branch:

```bash
git stash            # save your work
git checkout step-1  # or step-2, step-3, bonus-crossfade
```

See exactly what a step adds with `git diff main step-1`.

## ⚠️ About the API key

To keep the workshop simple, the key is saved in your browser (`localStorage`) and used
directly from the page. That's fine on your own machine, but never deploy it like this:
anyone could read your key from the page. In production,
keep the key on a server and relay requests, or use ephemeral tokens.

## Credits

Simplified from Google AI Studio's [Lyria Camera](https://ai.studio/apps/bundled/lyria_camera)
sample (Apache-2.0).

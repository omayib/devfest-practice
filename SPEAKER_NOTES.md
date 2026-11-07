# Speaker notes: Lyria Camera (45 min)

## Branches

| Branch | State | Diff to show on screen |
|---|---|---|
| `main` | Starter, all TODOs | |
| `step-1` | Gemini → prompts done | `git diff main step-1` |
| `step-2` | + Lyria streaming done | `git diff step-1 step-2` |
| `step-3` | + capture loop (complete app) | `git diff step-2 step-3` |
| `bonus-crossfade` | + smooth weight crossfades | `git diff step-3 bonus-crossfade` |

Run the demo from `bonus-crossfade`, which is the nicest-sounding version.

## Run of show

| Time | What | Notes |
|---|---|---|
| 0:00–0:05 | Demo the finished app | Point at a plant, then a screen, then a face. Let the music change. |
| 0:05–0:10 | Setup check + project tour | Hands up: who sees the "Step 1" message? Pair up anyone who doesn't. |
| 0:10–0:20 | **Step 1**: Gemini structured output | Talk about *why* JSON schema (no fragile parsing). Live-code it, then let them type. |
| 0:20–0:32 | **Step 2**: Lyria RealTime | Key concept: a persistent WebSocket stream, steered by weighted prompts. Mention 48 kHz stereo PCM chunks, but don't dwell on it (it's pre-written). |
| 0:32–0:40 | **Step 3**: Loop + custom system prompt | The fun part. Ask 2–3 people to share their system prompt. |
| 0:40–0:45 | Wrap-up | Crossfade bonus, production architecture (server-side key), resources. |

**If you're running late:** skip typing for step 3, check out `step-3`, and spend the time on
system-prompt experiments. That's the part people remember.

## One week before

- [ ] Run `bonus-crossfade` end to end with a fresh API key. Confirm `lyria-realtime-exp` on
      `v1alpha` still works and isn't region-blocked at the venue.
- [ ] Check rate limits: how many concurrent Lyria sessions a free-tier key allows.
- [ ] Push the repo to GitHub, replace `<REPO_URL>` in README.md, and send attendees the
      "Before the workshop" section.
- [ ] Record a 60-second screen capture of the app as a fallback if the API or Wi-Fi fails.

## On the day

- Ask for headphones. Use the room speakers only for your own demo.
- Have a QR code to the repo on the first slide.
- Common failures:
  - **"Missing API key"**: the file must be `.env.local` (not `.env.example`), and Vite needs
    a restart after creating it.
  - **No camera**: they're opening the network URL instead of `localhost`, or another app holds
    the camera.
  - **Prompts appear but there's no sound**: check the tab isn't muted, then check the console
    for a WebSocket error (key or region).
  - **"Lyria skipped …"**: the prompt was filtered (e.g. a real artist name). Expected behaviour,
    and a good teaching moment.

## What was removed from the original AI Studio sample, and why

- Express server + SDK proxy (~1,100 lines): the key now lives in the browser. **Say this out loud**
  and show the original architecture as the production answer.
- Lit components and styles (~1,300 lines) → plain HTML/TS (~150 lines).
- Screen share, camera switching, mirroring, interval presets, splash screen.
- Crossfade moved to the bonus branch.

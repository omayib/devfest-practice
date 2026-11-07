# Speaker notes: Lyria Camera (45 min)

## Two repos

| Repo | Who gets it | Contents |
|---|---|---|
| [lyria-workshop-starter](https://github.com/omayib/lyria-workshop-starter) | Attendees, before the workshop | Starter code with TODOs, one commit, no answers, no speaker notes |
| [devfest-practice](https://github.com/omayib/devfest-practice) (this repo) | You; URL shown on screen when someone is stuck | Starter on `main` plus a branch per step |

Catch-up for attendees (show this slide when needed):

```bash
git stash
git remote add solution https://github.com/omayib/devfest-practice.git
git fetch solution
git checkout solution/step-1        # or step-2, step-3, bonus-crossfade
```

If you change the starter code, change it in both repos (or re-export `main` here into the starter).

## Branches (this repo)

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
| 0:05–0:10 | Setup check + project tour | Hands up: who sees the "TODO Step 1" message? Pair up anyone who doesn't. |
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
- [ ] Test `serve.py` on Windows and macOS (or ask a volunteer to).
- [ ] Send attendees the starter repo link and its "Before the workshop" section.
- [ ] Record a 60-second screen capture of the app as a fallback if the API or Wi-Fi fails.

## On the day

- Ask for headphones. Use the room speakers only for your own demo.
- Have a QR code to the repo on the first slide.
- Common failures:
  - **Blank page / nothing happens**: they opened `index.html` by double-clicking (`file://`).
    It must be served: `python3 serve.py`, then <http://localhost:8000>.
  - **Wrong or expired key**: Gemini returns an error in the status line. Click "Change API key".
  - **No camera**: they're opening a network IP instead of `localhost`, or another app holds
    the camera.
  - **Edits don't show up**: they're using a server other than `serve.py` that caches files.
    Hard refresh (Ctrl/Cmd+Shift+R) or tick "Disable cache" in DevTools.
  - **Prompts appear but there's no sound**: check the tab isn't muted, then check the console
    for a WebSocket error (key or region).
  - **Music ignores one prompt**: Lyria silently drops prompts it filters (e.g. a real artist
    name). Expected behaviour, and a good teaching moment if someone's system prompt names a band.

## What was removed from the original AI Studio sample, and why

- npm, TypeScript and Vite: the SDK loads from a CDN via an import map, and `serve.py` is the
  only "tooling".
- Express server + SDK proxy (~1,100 lines): the key now lives in the browser. **Say this out loud**
  and show the original architecture as the production answer.
- Lit components and styles (~1,300 lines) → plain HTML/TS (~150 lines).
- Screen share, camera switching, mirroring, interval presets, splash screen.
- Crossfade moved to the bonus branch.
- Filtered-prompt UI (Lyria still filters prompts; we just don't display it).

/**
 * Wires the UI together. You only touch this file in step 3.
 */
import { API_KEY, CAPTURE_INTERVAL_MS } from "./config";
import { captureFrame, IMAGE_MIME_TYPE, startCamera } from "./camera";
import { imageToMusicPrompts } from "./gemini";
import { LyriaMusic } from "./music";

const video = document.querySelector<HTMLVideoElement>("#camera")!;
const snapshot = document.querySelector<HTMLImageElement>("#snapshot")!;
const toggle = document.querySelector<HTMLButtonElement>("#toggle")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const promptList = document.querySelector<HTMLUListElement>("#prompts")!;

const music = new LyriaMusic();
let running = false;
let loopTimer: number | undefined;
let countdownTimer: number | undefined;

// ---------------------------------------------------------------------------
// The core flow
// ---------------------------------------------------------------------------

/** Snapshot → Gemini → prompts on screen. */
async function captureAndGetPrompts(): Promise<string[]> {
  const capturedAt = performance.now();
  const frame = captureFrame(video);
  snapshot.src = `data:${IMAGE_MIME_TYPE};base64,${frame}`;
  snapshot.hidden = false;

  stopCountdown();
  setStatus("Asking Gemini what this looks like as music…");
  const prompts = await imageToMusicPrompts(frame);
  console.log("[gemini] prompts", prompts);
  renderPrompts(prompts);
  if (loopTimer !== undefined) startCountdown(capturedAt);
  return prompts;
}

async function start() {
  running = true;
  toggle.disabled = true;
  try {
    const prompts = await captureAndGetPrompts();
    setStatus("Connecting to Lyria RealTime…");
    await music.start(prompts);
    setStatus("Playing.");
    startLoop();
    if (loopTimer !== undefined) startCountdown(); // only once step 3 is done
  } catch (e) {
    showError(e);
    stop(false);
  } finally {
    toggle.disabled = false;
    toggle.textContent = running ? "■ Stop" : "▶ Start";
  }
}

/** Keeps the music following the camera. */
function startLoop() {
  // TODO(step 3): Every CAPTURE_INTERVAL_MS, take a new snapshot and steer the music:
  //
  //   loopTimer = window.setInterval(async () => {
  //     const prompts = await captureAndGetPrompts();
  //     await music.setPrompts(prompts);
  //   }, CAPTURE_INTERVAL_MS);
  //
  // Wrap the body in try/catch and pass errors to showError(), so one failed
  // request doesn't kill the loop.
}

function stop(resetStatus = true) {
  running = false;
  window.clearInterval(loopTimer);
  loopTimer = undefined;
  stopCountdown();
  music.stop();
  toggle.textContent = "▶ Start";
  if (resetStatus) setStatus("Stopped.");
}

// ---------------------------------------------------------------------------
// UI helpers (nothing to do here)
// ---------------------------------------------------------------------------

function setStatus(text: string, kind: "" | "todo" | "error" = "") {
  statusEl.textContent = text;
  statusEl.className = kind;
}

function showError(e: unknown) {
  console.error(e);
  stopCountdown(); // keep the message visible until the next snapshot
  const message = e instanceof Error ? e.message : String(e);
  if (message.startsWith("TODO")) setStatus(`🛠️ ${message}`, "todo");
  else setStatus(`⚠️ ${message}`, "error");
}

/** Status reads "Playing · next snapshot in 14s", counting down to the next loop tick. */
function startCountdown(from = performance.now()) {
  stopCountdown();
  const tick = () => {
    const seconds = Math.ceil((from + CAPTURE_INTERVAL_MS - performance.now()) / 1000);
    setStatus(`Playing · next snapshot in ${Math.max(0, seconds)}s`);
  };
  tick();
  countdownTimer = window.setInterval(tick, 250);
}

function stopCountdown() {
  window.clearInterval(countdownTimer);
}

function renderPrompts(prompts: string[]) {
  promptList.replaceChildren(
    ...prompts.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );
}

music.onError = (message) => {
  showError(new Error(message));
  stop(false);
};

toggle.addEventListener("click", () => (running ? stop() : start()));

(async () => {
  if (!API_KEY) {
    setStatus("Missing API key: copy .env.example to .env.local, add your key, restart npm run dev.", "error");
    toggle.disabled = true;
    return;
  }
  try {
    await startCamera(video);
    setStatus("Ready. Press Start.");
  } catch (e) {
    setStatus(`Camera unavailable: ${(e as Error).message}`, "error");
  }
})();

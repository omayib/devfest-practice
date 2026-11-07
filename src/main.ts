/**
 * Wires the UI together. You only touch this file in step 3.
 */
import { API_KEY, CAPTURE_INTERVAL_MS } from "./config";
import { captureFrame, IMAGE_MIME_TYPE, startCamera } from "./camera";
import { imageToMusicPrompts } from "./gemini";
import { LyriaMusic } from "./music";
import { TodoError } from "./todo";

const video = document.querySelector<HTMLVideoElement>("#camera")!;
const snapshot = document.querySelector<HTMLImageElement>("#snapshot")!;
const toggle = document.querySelector<HTMLButtonElement>("#toggle")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const promptList = document.querySelector<HTMLUListElement>("#prompts")!;

const music = new LyriaMusic();
let running = false;
let loopTimer: number | undefined;

// ---------------------------------------------------------------------------
// The core flow
// ---------------------------------------------------------------------------

/** Snapshot → Gemini → prompts on screen. */
async function captureAndGetPrompts(): Promise<string[]> {
  const frame = captureFrame(video);
  snapshot.src = `data:${IMAGE_MIME_TYPE};base64,${frame}`;
  snapshot.hidden = false;

  setStatus("Asking Gemini what this looks like as music…");
  const prompts = await imageToMusicPrompts(frame);
  console.log("[gemini] prompts", prompts);
  renderPrompts(prompts);
  return prompts;
}

async function start() {
  running = true;
  toggle.disabled = true;
  try {
    const prompts = await captureAndGetPrompts();
    if (!running) return;

    setStatus("Connecting to Lyria RealTime…");
    await music.start(prompts);
    setStatus(`Playing. New snapshot every ${CAPTURE_INTERVAL_MS / 1000}s.`);
    startLoop();
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
  if (e instanceof TodoError) {
    setStatus(`🛠️ ${e.message}`, "todo");
  } else {
    setStatus(`⚠️ ${e instanceof Error ? e.message : String(e)}`, "error");
  }
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

music.onFilteredPrompt = (text, reason) => {
  for (const li of promptList.children) {
    if (li.textContent === text) li.classList.add("filtered");
  }
  setStatus(`Lyria skipped "${text}": ${reason}`, "error");
};
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

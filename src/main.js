/**
 * Wires the UI together. You only touch this file in step 3.
 */
import { API_KEY, clearApiKey, saveApiKey } from "./api_key.js";
import { CAPTURE_INTERVAL_MS } from "./config.js";
import { captureFrame, IMAGE_MIME_TYPE, startCamera } from "./camera.js";
import { imageToMusicPrompts } from "./gemini.js";
import { LyriaMusic } from "./music.js";

const video = document.querySelector("#camera");
const snapshot = document.querySelector("#snapshot");
const toggle = document.querySelector("#toggle");
const statusEl = document.querySelector("#status");
const promptList = document.querySelector("#prompts");
const keyForm = document.querySelector("#key-form");
const keyInput = document.querySelector("#key-input");
const changeKey = document.querySelector("#change-key");

const music = new LyriaMusic();
let running = false;
let loopTimer;
let countdownTimer;

// ---------------------------------------------------------------------------
// The core flow
// ---------------------------------------------------------------------------

/** Snapshot → Gemini → prompts on screen. */
async function captureAndGetPrompts() {
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
  loopTimer = setInterval(async () => {
    try {
      const prompts = await captureAndGetPrompts();
      await music.setPrompts(prompts);
    } catch (e) {
      showError(e); // keep looping, the next snapshot may work
    }
  }, CAPTURE_INTERVAL_MS);
}

function stop(resetStatus = true) {
  running = false;
  clearInterval(loopTimer);
  loopTimer = undefined;
  stopCountdown();
  music.stop();
  toggle.textContent = "▶ Start";
  if (resetStatus) setStatus("Stopped.");
}

// ---------------------------------------------------------------------------
// UI helpers (nothing to do here)
// ---------------------------------------------------------------------------

function setStatus(text, kind = "") {
  statusEl.textContent = text;
  statusEl.className = kind;
}

function showError(e) {
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
  countdownTimer = setInterval(tick, 250);
}

function stopCountdown() {
  clearInterval(countdownTimer);
}

function renderPrompts(prompts) {
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

keyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveApiKey(keyInput.value.trim());
  location.reload();
});

changeKey.addEventListener("click", () => {
  clearApiKey();
  location.reload();
});

if (!API_KEY) {
  keyForm.hidden = false;
  toggle.hidden = true;
  setStatus("Paste your Gemini API key to begin.");
} else {
  changeKey.hidden = false;
  startCamera(video)
    .then(() => setStatus("Ready. Press Start."))
    .catch((e) => setStatus(`Camera unavailable: ${e.message}`, "error"));
}

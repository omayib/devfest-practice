/**
 * STEP 2: stream music from Lyria RealTime and steer it with prompts.
 */
import { GoogleGenAI } from "@google/genai";
import { API_KEY } from "./api_key.js";
import { MUSIC_MODEL } from "./config.js";
import { AudioPlayer } from "./audio_player.js";

// Lyria RealTime is experimental, so it lives on the v1alpha API.
const ai = new GoogleGenAI({ apiKey: API_KEY, apiVersion: "v1alpha" });

/** Seconds between weight updates during a crossfade. Lyria needs a moment to react. */
const CROSSFADE_STEP_SECONDS = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class LyriaMusic {
  session = null;
  player = new AudioPlayer();
  current = []; // the weighted prompts Lyria is playing right now
  fadeId = 0;

  /** Called with a message when the connection fails. */
  onError = () => {};

  /** Open a session, send the first prompts and start streaming. */
  async start(prompts) {
    await this.player.resume();

    this.session = await ai.live.music.connect({
      model: MUSIC_MODEL,
      callbacks: {
        onmessage: (message) => this.handleMessage(message),
        onerror: () => this.onError("Lost connection to Lyria RealTime."),
        onclose: () => console.log("[lyria] stream closed"),
      },
    });

    await this.setPrompts(prompts);
    this.session.play();
  }

  /** Steer the music. Lyria blends all prompts, weighted by `weight`. */
  async setPrompts(prompts) {
    this.fadeId++; // cancel any crossfade in progress
    await this.send(prompts.map((text) => ({ text, weight: 1.0 })));
  }

  /**
   * Gradually move from the current prompts to new ones: old weights ramp
   * 1 → 0 while new weights ramp 0 → 1, so the music morphs instead of jumping.
   */
  async crossfadeTo(prompts, seconds) {
    if (this.current.length === 0 || seconds <= 0) return this.setPrompts(prompts);

    const id = ++this.fadeId;
    const from = this.current;
    const steps = Math.max(1, Math.round(seconds / CROSSFADE_STEP_SECONDS));

    for (let i = 1; i <= steps; i++) {
      if (id !== this.fadeId || !this.session) return; // a newer change took over
      await this.send(blend(from, prompts, i / steps));
      if (i < steps) await sleep(CROSSFADE_STEP_SECONDS * 1000);
    }
  }

  async send(weightedPrompts) {
    this.current = weightedPrompts;
    console.log("[lyria] weights", weightedPrompts);
    await this.session?.setWeightedPrompts({ weightedPrompts });
  }

  handleMessage(message) {
    if (!this.session) return; // ignore chunks still in flight after stop()

    for (const chunk of message.serverContent?.audioChunks ?? []) {
      if (chunk.data) this.player.enqueue(chunk.data);
    }
  }

  stop() {
    this.session?.stop();
    this.session = null;
    this.current = [];
    this.fadeId++;
    this.player.stop();
  }
}

/** Old prompts weighted (1 - t), new prompts weighted t. Shared texts are summed. */
function blend(from, to, t) {
  const weights = new Map();
  for (const p of from) weights.set(p.text, (weights.get(p.text) ?? 0) + p.weight * (1 - t));
  for (const text of to) weights.set(text, (weights.get(text) ?? 0) + t);
  return [...weights]
    .filter(([, weight]) => weight > 0.001)
    .map(([text, weight]) => ({ text, weight: Number(weight.toFixed(3)) }));
}

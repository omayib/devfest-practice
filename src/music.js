/**
 * STEP 2: stream music from Lyria RealTime and steer it with prompts.
 */
import { GoogleGenAI } from "@google/genai";
import { API_KEY } from "./api_key.js";
import { MUSIC_MODEL } from "./config.js";
import { AudioPlayer } from "./audio_player.js";

// Lyria RealTime is experimental, so it lives on the v1alpha API.
const ai = new GoogleGenAI({ apiKey: API_KEY, apiVersion: "v1alpha" });

export class LyriaMusic {
  session = null;
  player = new AudioPlayer();

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
    await this.session?.setWeightedPrompts({
      weightedPrompts: prompts.map((text) => ({ text, weight: 1.0 })),
    });
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
    this.player.stop();
  }
}

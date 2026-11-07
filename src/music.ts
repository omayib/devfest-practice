/**
 * STEP 2: stream music from Lyria RealTime and steer it with prompts.
 */
import { GoogleGenAI, type LiveMusicServerMessage, type LiveMusicSession } from "@google/genai";
import { API_KEY, MUSIC_MODEL } from "./config";
import { AudioPlayer } from "./audio_player";

// Lyria RealTime is experimental, so it lives on the v1alpha API.
const ai = new GoogleGenAI({ apiKey: API_KEY, apiVersion: "v1alpha" });

export class LyriaMusic {
  private session: LiveMusicSession | null = null;
  private readonly player = new AudioPlayer();

  /** Called when the connection fails. */
  onError: (message: string) => void = () => {};

  /** Open a session, send the first prompts and start streaming. */
  async start(prompts: string[]): Promise<void> {
    await this.player.resume();

    // TODO(step 2a): Connect and keep the session:
    //
    //   this.session = await ai.live.music.connect({
    //     model: MUSIC_MODEL,
    //     callbacks: {
    //       onmessage: (message) => this.handleMessage(message),
    //       onerror: ...  (call this.onError)
    //       onclose: ...  (a console.log is fine)
    //     },
    //   });
    //
    // TODO(step 2b): Send the prompts (implement setPrompts below).
    // TODO(step 2c): Start the stream with this.session.play().
    throw new Error("TODO Step 2: implement LyriaMusic.start() in src/music.ts");
  }

  /** Steer the music. Lyria blends all prompts, weighted by `weight`. */
  async setPrompts(prompts: string[]): Promise<void> {
    // TODO(step 2b): Call this.session.setWeightedPrompts({ weightedPrompts })
    //   where weightedPrompts looks like [{ text: "warm lo-fi piano", weight: 1.0 }, ...]
    throw new Error("TODO Step 2: implement LyriaMusic.setPrompts() in src/music.ts");
  }

  private handleMessage(message: LiveMusicServerMessage): void {
    // TODO(step 2a): Audio arrives in message.serverContent?.audioChunks.
    //   Pass each chunk's `.data` (base64 PCM) to this.player.enqueue(...).
  }

  stop(): void {
    this.session?.stop();
    this.session = null;
    this.player.stop();
  }
}

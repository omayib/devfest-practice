/**
 * Plays the raw audio chunks streamed by Lyria RealTime. Already done for you.
 *
 * Lyria sends 16-bit PCM, 48 kHz, stereo (interleaved L/R), base64-encoded.
 * We decode each chunk into an AudioBuffer and schedule it right after the
 * previous one, so playback is gapless.
 */

const SAMPLE_RATE = 48_000;

/** Audio we buffer before starting, to absorb network jitter. */
const BUFFER_SECONDS = 2;

export class AudioPlayer {
  private readonly ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
  private output = this.createOutput();
  private nextStartTime = 0;

  /** Browsers only allow audio after a user gesture, so call this from a click. */
  async resume(): Promise<void> {
    await this.ctx.resume();
  }

  /** Queue one base64 PCM chunk for playback. */
  enqueue(base64Pcm: string): void {
    const buffer = this.decode(base64Pcm);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.output);

    // First chunk, or we fell behind (network hiccup): build up a buffer again.
    if (this.nextStartTime < this.ctx.currentTime) {
      this.nextStartTime = this.ctx.currentTime + BUFFER_SECONDS;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  /** Fade out whatever is queued and reset. */
  stop(): void {
    const now = this.ctx.currentTime;
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.linearRampToValueAtTime(0, now + 0.5);
    this.output = this.createOutput();
    this.nextStartTime = 0;
  }

  private createOutput(): GainNode {
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);
    return gain;
  }

  private decode(base64Pcm: string): AudioBuffer {
    const binary = atob(base64Pcm);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
    const frames = Math.floor(pcm.length / 2);
    const buffer = this.ctx.createBuffer(2, frames, SAMPLE_RATE);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < frames; i++) {
      left[i] = pcm[2 * i] / 32768;
      right[i] = pcm[2 * i + 1] / 32768;
    }
    return buffer;
  }
}

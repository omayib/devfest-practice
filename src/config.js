/**
 * Everything you might want to tweak lives here.
 */

/** Fast, cheap multimodal model that turns a camera frame into music prompts. */
export const VISION_MODEL = "gemini-3.5-flash-lite";

/** Lyria RealTime: streams music continuously and can be steered with prompts. */
export const MUSIC_MODEL = "models/lyria-realtime-exp";

/** How often we take a new snapshot and steer the music (milliseconds). */
export const CAPTURE_INTERVAL_MS = 20_000;

/**
 * The instruction Gemini gets alongside each camera frame.
 * Step 3: make this your own!
 */
export const SYSTEM_PROMPT =
  "You are a creative music director. Analyze the vibe, objects, and emotions in this image. " +
  "Generate 3 short, evocative phrases, 4 to 5 words maximum per phrase, that can be used as " +
  "prompts for an AI music generator. The phrases should describe genres, moods, instruments, " +
  "or sound textures.";

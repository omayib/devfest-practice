/**
 * STEP 1: camera frame → Gemini → 3 music prompts.
 */
import { GoogleGenAI, Type } from "@google/genai";
import { API_KEY } from "./api_key.js";
import { SYSTEM_PROMPT, VISION_MODEL } from "./config.js";
import { IMAGE_MIME_TYPE } from "./camera.js";

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Sends one camera frame (base64) to Gemini and returns short music prompts,
 * e.g. ["warm lo-fi piano", "rainy window ambience", "slow jazz brushes"].
 */
export async function imageToMusicPrompts(base64Image) {
  // TODO(step 1): Call `ai.models.generateContent({ model, contents, config })`.
  //
  //   model:    VISION_MODEL
  //   contents: two parts, the image and the instruction:
  //             { inlineData: { mimeType: IMAGE_MIME_TYPE, data: base64Image } }
  //             { text: SYSTEM_PROMPT }
  //   config:   ask for JSON shaped like { "prompts": ["...", "...", "..."] }
  //             using responseMimeType "application/json" and a responseSchema
  //             (use the `Type` enum: Type.OBJECT, Type.ARRAY, Type.STRING).
  //
  // Then JSON.parse(response.text) and return the `prompts` array.
  throw new Error("TODO Step 1: implement imageToMusicPrompts() in src/gemini.js");
}

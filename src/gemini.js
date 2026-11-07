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
  const response = await ai.models.generateContent({
    model: VISION_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: IMAGE_MIME_TYPE, data: base64Image } },
          { text: SYSTEM_PROMPT },
        ],
      },
    ],
    config: {
      // Structured output: Gemini must answer with JSON matching this schema.
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            description: "3 short, creative music prompts",
            items: { type: Type.STRING },
          },
        },
        required: ["prompts"],
      },
    },
  });

  const json = JSON.parse(response.text ?? "{}");
  return json.prompts ?? [];
}

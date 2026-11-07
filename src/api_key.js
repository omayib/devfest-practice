/**
 * Your Gemini API key, saved in this browser by the form on the page.
 * Fine for a workshop on your own laptop. Never ship a key inside a public web page.
 */
const STORAGE_KEY = "gemini-api-key";

export const API_KEY = readApiKey();

export function saveApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {}
}

export function clearApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function readApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

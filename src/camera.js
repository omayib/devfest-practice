/**
 * Camera helpers. Already done for you, no TODOs here.
 */

export const IMAGE_MIME_TYPE = "image/jpeg";

/** Small frames keep the Gemini call fast. 256px is plenty to get the vibe. */
const MAX_CAPTURE_DIM = 256;

export async function startCamera(video) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
}

/** Grabs the current video frame, downscaled, as base64 (without the data: prefix). */
export function captureFrame(video) {
  const scale = Math.min(1, MAX_CAPTURE_DIM / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(IMAGE_MIME_TYPE, 0.8).split(",")[1];
}

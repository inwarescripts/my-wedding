const VIDEO_EXTENSIONS = ["mp4", "mov", "webm"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "ogg"];

function extensionOf(url: string): string {
  const clean = url.split(/[?#]/)[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return VIDEO_EXTENSIONS.includes(extensionOf(url));
}

export function isAudioUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return AUDIO_EXTENSIONS.includes(extensionOf(url));
}

export type MediaKind = "image" | "video" | "audio";

export function mediaKindOf(url: string): MediaKind {
  if (isVideoUrl(url)) return "video";
  if (isAudioUrl(url)) return "audio";
  return "image";
}

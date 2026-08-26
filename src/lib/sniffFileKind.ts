export type SniffedKind = "image" | "audio" | "video" | "unknown";

/** Reads the first few bytes of a file and checks them against known format
 * "magic numbers" — catches a file whose real content doesn't match its
 * extension (e.g. a photo renamed/mislabeled to .mp3), which the browser's
 * file picker and the server's extension-based Content-Type never catch. */
export async function sniffFileKind(file: File): Promise<SniffedKind> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  // Images
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image"; // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image"; // PNG
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image"; // GIF

  const isRiff = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
  if (isRiff) {
    const tag = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
    if (tag === "WEBP") return "image";
    if (tag === "WAVE") return "audio";
  }

  // Audio
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return "audio"; // ID3-tagged MP3
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return "audio"; // raw MPEG frame sync (ID3-less MP3)

  // MP4/MOV/M4A all share the "ftyp" box at offset 4
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]).trim();
    if (brand === "M4A") return "audio";
    return "video";
  }
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return "video"; // WebM/MKV (EBML)

  return "unknown";
}

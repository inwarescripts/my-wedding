const MAX_DIMENSION = 2000;
// 0.82 visibly softened detailed photo content (hair, flowers, fabric) —
// same finding as next.config.ts's `qualities` comment for the old
// Vercel-optimized path. 0.9 is close to visually lossless for photos while
// still shrinking multi-MB originals substantially.
const WEBP_QUALITY = 0.9;

/**
 * Downscales + re-encodes an image to WebP in the browser before it's
 * uploaded — S3 otherwise stores whatever the admin's phone/camera produced
 * (often 3000-4000px, several MB), and with Vercel's Image Optimization
 * turned off (see next.config.ts — its quota got exceeded), that raw file is
 * exactly what every guest's browser would download. Skips GIFs (would lose
 * animation) and anything the re-encode doesn't actually shrink.
 */
export async function resizeImageForUpload(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], newName, { type: "image/webp" });
}

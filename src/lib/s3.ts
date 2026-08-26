import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type RequiredEnvVar = "S3_REGION" | "S3_BUCKET" | "S3_KEY" | "S3_SECRET";

function requireEnv(name: RequiredEnvVar): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

const s3 = new S3Client({
  region: requireEnv("S3_REGION"),
  credentials: {
    accessKeyId: requireEnv("S3_KEY"),
    secretAccessKey: requireEnv("S3_SECRET"),
  },
});

const bucket = () => requireEnv("S3_BUCKET");
const prefix = () => (process.env.S3_PREFIX || "wedding").replace(/^\/|\/$/g, "");

// Only allow known-safe types — no SVG (can embed scripts), no executables.
const ALLOWED_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
};

function buildFileUrl(key: string): string {
  const cdnUrl = process.env.S3_CDN_URL;
  if (cdnUrl) return `${cdnUrl.replace(/\/$/, "")}/${key}`;
  return `https://${bucket()}.s3.${requireEnv("S3_REGION")}.amazonaws.com/${key}`;
}

export interface PresignedUpload {
  signedUrl: string;
  fileUrl: string;
  key: string;
  contentType: string;
}

/** Same sanitizing spirit as urban's sanitizeFolder/sanitizeUserSegment —
 * the slug ends up in an S3 key, so strip anything that isn't a safe path
 * segment character before it's ever joined in. */
function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) || "project";
}

/**
 * Generates a presigned S3 PUT URL for one file. The browser uploads
 * directly to S3 with this URL — the Next.js server never sees the file
 * bytes (see spec: presigned upload architecture).
 *
 * Key layout mirrors urban/apps/backend/src/utilities/awsUtils.ts:
 *   {S3_PREFIX}/{projectSlug}/{yyyy}/{MM}/{timestamp}.{safeName}.{ext}
 */
export async function createPresignedUpload(
  fileName: string,
  projectSlug: string
): Promise<PresignedUpload> {
  const parts = fileName.split(".");
  const extension = (parts.length > 1 ? parts.pop()! : "").toLowerCase();
  const contentType = ALLOWED_MIME_TYPES[extension];
  if (!contentType) {
    throw new Error(`UNSUPPORTED_FILE_TYPE: .${extension}`);
  }

  const safeName = parts
    .join(".")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const key = [
    prefix(),
    sanitizeSlug(projectSlug),
    `${yyyy}`,
    mm,
    `${Date.now()}.${safeName || "file"}.${extension}`,
  ].join("/");

  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  return { signedUrl, fileUrl: buildFileUrl(key), key, contentType };
}

export async function headObject(key: string) {
  const res = await s3.send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
  return { size: res.ContentLength, mimeType: res.ContentType };
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

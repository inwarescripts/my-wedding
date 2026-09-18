import { PrismaClient } from "@prisma/client";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

/**
 * One-off backfill: shrinks every already-uploaded image asset in place
 * (same S3 key, same URL — nothing referencing it needs to change) down to
 * a sane max dimension + re-encoded WebP.
 *
 * Why this exists: uploads go straight from the browser to S3 with no
 * resize step (see src/app/admin/actions/media.ts), so anything uploaded
 * before resizeImageForUpload() was added is still the admin's original
 * phone/camera file — often 3000-4000px, several MB. With Vercel's Image
 * Optimization now disabled (its quota got exceeded — see next.config.ts),
 * those originals are exactly what guests' browsers download today.
 *
 * Run: npx tsx --env-file=.env scripts/reprocessImages.ts
 */

const MAX_DIMENSION = 2000;
// Matches resizeImage.ts's client-side quality — 82 visibly softened
// detailed photo content, 90 is close to visually lossless for photos.
const WEBP_QUALITY = 90;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: requireEnv("S3_REGION"),
  credentials: {
    accessKeyId: requireEnv("S3_KEY"),
    secretAccessKey: requireEnv("S3_SECRET"),
  },
});
const bucket = requireEnv("S3_BUCKET");

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function main() {
  const assets = await prisma.asset.findMany({
    where: {
      status: "uploaded",
      key: { not: null },
      mimeType: { in: ["image/jpeg", "image/png", "image/webp"] },
    },
  });

  console.log(`Found ${assets.length} image assets to check.`);

  let shrunk = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of assets) {
    if (!asset.key) continue;
    try {
      const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: asset.key }));
      if (!obj.Body) throw new Error("empty response body");
      const original = await streamToBuffer(obj.Body as NodeJS.ReadableStream);

      const resized = await sharp(original)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      if (resized.length >= original.length) {
        skipped++;
        console.log(`skip (already smaller): ${asset.key}`);
        continue;
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: asset.key,
          Body: resized,
          ContentType: "image/webp",
          ACL: "public-read",
        })
      );

      await prisma.asset.update({
        where: { id: asset.id },
        data: { size: resized.length, mimeType: "image/webp" },
      });

      shrunk++;
      console.log(
        `resized ${asset.key}: ${(original.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`
      );
    } catch (err) {
      failed++;
      console.error(`failed ${asset.key}:`, err);
    }
  }

  console.log(`Done. shrunk=${shrunk} skipped=${skipped} failed=${failed}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

"use server";

import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { createPresignedUpload, deleteObject, headObject } from "@/lib/s3";

export interface RequestUploadResult {
  assetId: string;
  signedUrl: string;
  fileUrl: string;
  contentType: string;
}

/**
 * Step 1 of the upload flow: create a pending Asset row + a presigned S3 PUT
 * URL. The browser then PUTs the file bytes straight to S3 (see
 * confirmAssetUploaded for step 2).
 */
export async function requestAssetUpload(
  projectId: string,
  fileName: string
): Promise<RequestUploadResult> {
  await requireProjectAccess(projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const { signedUrl, fileUrl, key, contentType } = await createPresignedUpload(
    fileName,
    project.slug
  );

  const asset = await prisma.asset.create({
    data: {
      projectId,
      key,
      url: fileUrl,
      filename: fileName,
      mimeType: contentType,
      status: "pending",
    },
  });

  return { assetId: asset.id, signedUrl, fileUrl, contentType };
}

/**
 * Step 2: called once the browser's direct PUT to S3 succeeds. HEADs the
 * object to confirm it actually landed and to record its real size, then
 * flips the Asset to uploaded.
 */
export async function confirmAssetUploaded(assetId: string): Promise<void> {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || !asset.key) throw new Error("ASSET_NOT_FOUND");
  await requireProjectAccess(asset.projectId);

  const { size, mimeType } = await headObject(asset.key);

  await prisma.asset.update({
    where: { id: assetId },
    data: {
      status: "uploaded",
      size: size ?? undefined,
      mimeType: mimeType ?? asset.mimeType,
    },
  });
}

export async function deleteAsset(assetId: string): Promise<void> {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return;
  await requireProjectAccess(asset.projectId);

  if (asset.key) {
    await deleteObject(asset.key);
  }
  await prisma.asset.delete({ where: { id: assetId } });
}

/** Frame content only stores plain URL strings, not asset ids — this looks
 * the row up by its public URL so the dropzone can clean up on remove. */
export async function deleteAssetByUrl(url: string): Promise<void> {
  const asset = await prisma.asset.findFirst({ where: { url } });
  if (!asset) return;
  await requireProjectAccess(asset.projectId);

  if (asset.key) {
    await deleteObject(asset.key);
  }
  await prisma.asset.delete({ where: { id: asset.id } });
}

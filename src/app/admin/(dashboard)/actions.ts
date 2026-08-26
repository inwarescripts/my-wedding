"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireProjectAccess } from "@/lib/authz";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip Vietnamese diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "du-an";
}

export async function createProject(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Tên dự án không được để trống");

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;
  // Slugs are unique — retry with a short numeric suffix on collision rather
  // than failing the whole creation over a name two couples happen to share.
  while (await prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const weddingDate = new Date();
  weddingDate.setDate(weddingDate.getDate() + 90);

  const project = await prisma.project.create({
    data: {
      slug,
      name,
      status: "draft",
      userId: session.user.id,
      couple: {
        create: {
          groomName: "",
          brideName: "",
          displayName: name,
          weddingDate,
        },
      },
      frames: {
        create: [
          { type: "opening", order: 0, enabled: true, content: {}, animation: { variant: "particleBloom" } },
          { type: "hero", order: 1, enabled: true, content: {} },
        ],
      },
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/projects/${project.id}/editor`);
}

export async function deleteProject(projectId: string) {
  await requireProjectAccess(projectId);
  // Cascades to Couple/Frame/Asset/Event/RsvpEntry/GuestbookEntry/GiftAccount
  // via onDelete: Cascade on each relation — S3 objects referenced by those
  // assets are not cleaned up here (best-effort, same as the single-asset
  // delete actions in admin/actions/media.ts), only the DB rows.
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/admin");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireProjectAccess, requireAdmin } from "@/lib/authz";
import { copyObject, deleteObject } from "@/lib/s3";
import { slugify } from "@/lib/slugify";
import { RSVP_PAGE_SIZE, type RsvpEntryItem } from "./rsvp-types";

function oneMonthFromNow(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

/** Recursively replaces any string that exactly matches a key in `urlMap` —
 * used to point a cloned project's frame content / cover image at the
 * clone's own copied S3 objects instead of the source project's. */
function remapUrlsDeep<T>(value: T, urlMap: Map<string, string>): T {
  if (typeof value === "string") {
    return (urlMap.get(value) ?? value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => remapUrlsDeep(v, urlMap)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = remapUrlsDeep(v, urlMap);
    }
    return out as T;
  }
  return value;
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
      expiredAt: oneMonthFromNow(),
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

  // Each project now owns its own S3 objects (clones get their own copies,
  // see cloneProject), so it's safe to actually delete them here instead of
  // leaving them orphaned. Best-effort: a failed object delete doesn't block
  // removing the project — same tradeoff as the single-asset delete actions
  // in admin/actions/media.ts.
  const assets = await prisma.asset.findMany({
    where: { projectId, key: { not: null } },
    select: { key: true },
  });
  await Promise.allSettled(
    assets.map((a) => deleteObject(a.key as string))
  );

  // Cascades to Couple/Frame/Asset/Event/RsvpEntry/GuestbookEntry/GiftAccount
  // via onDelete: Cascade on each relation.
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/admin");
}

/** Admin-only: duplicate a project's entire config (couple, frames, events,
 * gift accounts, settings) into a brand-new draft project — not RSVP replies
 * or guestbook messages, those belong to the original instance, not the
 * template being cloned. */
export async function cloneProject(projectId: string, name: string) {
  const session = await requireAdmin();
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Tên dự án không được để trống");

  const source = await prisma.project.findUnique({
    where: { id: projectId },
    include: { couple: true, frames: true, events: true, gifts: true, assets: true },
  });
  if (!source) throw new Error("Không tìm thấy dự án");

  // Slug (and therefore the clone's S3 key prefix) is derived from the name
  // the admin typed in the clone modal, not auto-suffixed off the source's
  // slug — so the new project's storage path reads as its own thing.
  const baseSlug = slugify(trimmedName);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  // Give the clone its own independent copy of every uploaded S3 object —
  // otherwise it'd share the source's objects by URL, and removing an image
  // from either project's editor (which hard-deletes the S3 object, see
  // deleteAssetByUrl) would silently break it in the other one too.
  const urlMap = new Map<string, string>();
  const newAssetsData: {
    key: string;
    url: string;
    filename: string | null;
    mimeType: string | null;
    size: number | null;
    status: "uploaded";
  }[] = [];
  for (const asset of source.assets) {
    if (asset.status !== "uploaded" || !asset.key) continue;
    const { key, fileUrl } = await copyObject(asset.key, slug);
    urlMap.set(asset.url, fileUrl);
    newAssetsData.push({
      key,
      url: fileUrl,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      status: "uploaded",
    });
  }

  const cloned = await prisma.project.create({
    data: {
      slug,
      name: trimmedName,
      status: "draft",
      userId: session.user.id,
      expiredAt: oneMonthFromNow(),
      settings: source.settings
        ? (remapUrlsDeep(source.settings, urlMap) as object)
        : undefined,
      couple: source.couple
        ? {
            create: {
              groomName: source.couple.groomName,
              brideName: source.couple.brideName,
              displayName: source.couple.displayName,
              weddingDate: source.couple.weddingDate,
              weddingDateLunar: source.couple.weddingDateLunar,
              coverImage: source.couple.coverImage
                ? urlMap.get(source.couple.coverImage) ?? source.couple.coverImage
                : null,
              quote: source.couple.quote,
            },
          }
        : undefined,
      frames: {
        create: source.frames.map((f) => ({
          type: f.type,
          order: f.order,
          enabled: f.enabled,
          content: remapUrlsDeep(f.content, urlMap) as object,
          style: f.style ? (remapUrlsDeep(f.style, urlMap) as object) : undefined,
          animation: f.animation ?? undefined,
          responsive: f.responsive ?? undefined,
        })),
      },
      events: {
        create: source.events.map((e) => ({
          name: e.name,
          date: e.date,
          time: e.time,
          venue: e.venue,
          address: e.address,
          lat: e.lat,
          lng: e.lng,
          mapUrl: e.mapUrl,
          order: e.order,
        })),
      },
      gifts: {
        create: source.gifts.map((g) => ({
          label: g.label,
          bank: g.bank,
          accountName: g.accountName,
          accountNumber: g.accountNumber,
        })),
      },
      assets: {
        createMany: { data: newAssetsData },
      },
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/projects/${cloned.id}/editor`);
}

export interface AssignableUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

/** Admin-only: users eligible to own a project, for the assign modal's
 * picker list. */
export async function getAssignableUsers(): Promise<AssignableUser[]> {
  await requireAdmin();
  return prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true },
    orderBy: { name: "asc" },
  });
}

/** Admin-only: reassigns a project's single owner — 1 project has exactly
 * one owner (`Project.userId`), so this replaces whoever held it before.
 * `userId: null` leaves it unowned (admin-only access, same as a project
 * whose owner account was deleted). */
export async function assignProjectOwner(projectId: string, userId: string | null) {
  await requireAdmin();
  await prisma.project.update({ where: { id: projectId }, data: { userId } });
  revalidatePath("/admin");
}

export async function getRsvpEntriesPage(projectId: string, page: number) {
  await requireProjectAccess(projectId);

  const [entries, total] = await Promise.all([
    prisma.rsvpEntry.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * RSVP_PAGE_SIZE,
      take: RSVP_PAGE_SIZE,
    }),
    prisma.rsvpEntry.count({ where: { projectId } }),
  ]);

  return {
    entries: entries.map((e) => ({
      id: e.id,
      name: e.name,
      phone: e.phone,
      attending: e.attending,
      guestCount: e.guestCount,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
    })) satisfies RsvpEntryItem[],
    total,
  };
}

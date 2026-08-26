"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import type {
  CoupleInfo,
  EventItem,
  FrameType,
  GiftAccountItem,
  ProjectSettings,
} from "@/types/wedding-config";

export interface SaveProjectPayload {
  project: { name: string; slug: string; status: "draft" | "published" };
  couple: CoupleInfo;
  frames: Array<{
    id: string;
    type: FrameType;
    enabled: boolean;
    variant?: string;
    content: unknown;
  }>;
  events: EventItem[];
  gifts: GiftAccountItem[];
  settings: ProjectSettings;
}

export async function saveProjectConfig(projectId: string, payload: SaveProjectPayload) {
  await requireProjectAccess(projectId);

  // Fetch the slug as it stood before this save — if the admin renamed it,
  // the old "/wedding/{oldSlug}" URL needs revalidating too, or Next would
  // keep serving its last cached HTML instead of a 404.
  const previous = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        name: payload.project.name,
        slug: payload.project.slug,
        status: payload.project.status,
        publishedAt: payload.project.status === "published" ? new Date() : null,
        settings: payload.settings as unknown as object,
      },
    });

    await tx.couple.update({
      where: { projectId },
      data: {
        groomName: payload.couple.groomName,
        brideName: payload.couple.brideName,
        displayName: payload.couple.displayName,
        weddingDate: new Date(payload.couple.weddingDate),
        weddingDateLunar: payload.couple.weddingDateLunar || null,
        coverImage: payload.couple.coverImage || null,
        quote: payload.couple.quote || null,
      },
    });

    // The frame list's array order IS the display order (drag/reorder in the
    // editor just reorders this array), so persist order = index here rather
    // than trusting a separate `order` field the client would have to keep
    // in sync by hand.
    const existing = await tx.frame.findMany({
      where: { projectId },
      select: { id: true },
    });
    const keepIds = new Set(
      payload.frames.filter((f) => !f.id.startsWith("new-")).map((f) => f.id)
    );
    const toDelete = existing.map((f) => f.id).filter((id) => !keepIds.has(id));
    if (toDelete.length > 0) {
      await tx.frame.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const [order, frame] of payload.frames.entries()) {
      const data = {
        order,
        enabled: frame.enabled,
        content: frame.content as object,
        ...(frame.variant ? { animation: { variant: frame.variant } } : {}),
      };

      if (frame.id.startsWith("new-")) {
        await tx.frame.create({ data: { ...data, projectId, type: frame.type } });
      } else {
        await tx.frame.update({ where: { id: frame.id }, data });
      }
    }

    await tx.event.deleteMany({ where: { projectId } });
    if (payload.events.length > 0) {
      await tx.event.createMany({
        data: payload.events.map((e, i) => ({
          projectId,
          name: e.name,
          date: new Date(e.date),
          time: e.time,
          venue: e.venue,
          address: e.address,
          order: i,
        })),
      });
    }

    await tx.giftAccount.deleteMany({ where: { projectId } });
    if (payload.gifts.length > 0) {
      await tx.giftAccount.createMany({
        data: payload.gifts.map((g) => ({
          projectId,
          label: g.label,
          bank: g.bank,
          accountName: g.accountName,
          accountNumber: g.accountNumber,
        })),
      });
    }
  });

  revalidatePath(`/admin/projects/${projectId}/editor`);
  revalidatePath(`/wedding/${payload.project.slug}`);
  if (previous && previous.slug !== payload.project.slug) {
    revalidatePath(`/wedding/${previous.slug}`);
  }
  revalidatePath("/");
}

export async function setGuestbookStatus(
  projectId: string,
  entryId: string,
  status: "approved" | "hidden"
) {
  await requireProjectAccess(projectId);

  const project = await prisma.guestbookEntry.update({
    where: { id: entryId },
    data: { status },
    select: { project: { select: { slug: true } } },
  });

  revalidatePath(`/admin/projects/${projectId}/editor`);
  revalidatePath(`/wedding/${project.project.slug}`);
}

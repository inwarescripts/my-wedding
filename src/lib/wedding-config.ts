import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  defaultProjectSettings,
  type WeddingConfig,
  type ProjectSettings,
  type FrameType,
} from "@/types/wedding-config";

const projectInclude = {
  couple: true,
  frames: { orderBy: { order: "asc" as const } },
  events: { orderBy: { order: "asc" as const } },
  gifts: true,
  // All statuses come back here; toWeddingConfig() below narrows to
  // "approved" for the public-facing shape. The admin editor needs the
  // full list (see getEditorData) to moderate pending/hidden entries.
  guestbook: { orderBy: { createdAt: "desc" as const } },
};

type ProjectWithRelations = NonNullable<
  Awaited<ReturnType<typeof fetchProjectRow>>
>;

function fetchProjectRow(where: { id: string } | { slug: string }) {
  return prisma.project.findUnique({ where, include: projectInclude });
}

function parseSettings(raw: unknown): ProjectSettings {
  if (!raw || typeof raw !== "object") return defaultProjectSettings;
  // `petals: { enabled }` was the shape before ambientEffect became a
  // registry of 5 variants — keep reading it so projects saved earlier
  // don't silently lose their toggle.
  const r = raw as Partial<ProjectSettings> & { petals?: { enabled?: boolean } };
  const ambientEffect =
    r.ambientEffect ?? (r.petals?.enabled ? "petals" : defaultProjectSettings.ambientEffect);
  return {
    typographyVariant:
      r.typographyVariant ?? defaultProjectSettings.typographyVariant,
    music: { ...defaultProjectSettings.music, ...r.music },
    transitionVariant:
      r.transitionVariant ?? defaultProjectSettings.transitionVariant,
    ambientEffect,
    confettiCannon: r.confettiCannon ?? defaultProjectSettings.confettiCannon,
    introSequence: {
      enabled: r.introSequence?.enabled ?? defaultProjectSettings.introSequence.enabled,
      // `autoScrollSeconds` was the shape before this became a constant
      // px/sec speed — old saved values are simply dropped in favor of the
      // new default rather than misread as a speed number.
      scrollSpeed: r.introSequence?.scrollSpeed ?? defaultProjectSettings.introSequence.scrollSpeed,
    },
    colorTheme: r.colorTheme ?? defaultProjectSettings.colorTheme,
    background: {
      mode: r.background?.mode ?? defaultProjectSettings.background.mode,
      pattern: r.background?.pattern ?? defaultProjectSettings.background.pattern,
    },
    bowStyle: r.bowStyle ?? defaultProjectSettings.bowStyle,
    chatPosition: r.chatPosition ?? defaultProjectSettings.chatPosition,
  };
}

export function toWeddingConfig(project: ProjectWithRelations): WeddingConfig {
  if (!project.couple) {
    throw new Error(`Project ${project.id} has no couple record`);
  }

  return {
    projectId: project.id,
    slug: project.slug,
    couple: {
      groomName: project.couple.groomName,
      brideName: project.couple.brideName,
      displayName: project.couple.displayName,
      weddingDate: project.couple.weddingDate.toISOString(),
      weddingDateLunar: project.couple.weddingDateLunar,
      coverImage: project.couple.coverImage,
      quote: project.couple.quote,
    },
    frames: project.frames.map((f) => ({
      id: f.id,
      type: f.type as FrameType,
      order: f.order,
      enabled: f.enabled,
      variant:
        f.animation && typeof f.animation === "object" && "variant" in f.animation
          ? String((f.animation as { variant?: unknown }).variant ?? "")
          : undefined,
      content: f.content,
    })),
    events: project.events.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date.toISOString(),
      time: e.time,
      venue: e.venue,
      address: e.address,
    })),
    gifts: project.gifts.map((g) => ({
      id: g.id,
      label: g.label,
      bank: g.bank,
      accountName: g.accountName,
      accountNumber: g.accountNumber,
    })),
    guestbook: project.guestbook
      .filter((g) => g.status === "approved")
      .map((g) => ({
        id: g.id,
        name: g.name,
        message: g.message,
      })),
    settings: parseSettings(project.settings),
  };
}

export async function getWeddingConfigBySlug(
  slug: string
): Promise<WeddingConfig | null> {
  const project = await fetchProjectRow({ slug });
  if (!project) return null;
  return toWeddingConfig(project);
}

// The public "/wedding/[slug]" route only ever shows published snapshots —
// a draft is only visible from inside the admin editor (see spec item 91:
// draft is editable, published is a stable snapshot). Wrapped in cache()
// so generateMetadata() and the page component share one DB round-trip.
export const getPublishedWeddingConfigBySlug = cache(
  async (slug: string): Promise<WeddingConfig | null> => {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: projectInclude,
    });
    if (!project || project.status !== "published") return null;
    // Hard-gone for guests once expired — not just "can't be edited" (that
    // rule lives in the admin editor's save action). A guest hitting an
    // expired couple's link should see the same 404 as a slug that never
    // existed, not a stale snapshot of a lapsed project.
    if (project.expiredAt && project.expiredAt.getTime() < Date.now()) return null;
    return toWeddingConfig(project);
  }
);

export async function getWeddingConfigByProjectId(
  id: string
): Promise<WeddingConfig | null> {
  const project = await fetchProjectRow({ id });
  if (!project) return null;
  return toWeddingConfig(project);
}

export interface GuestbookAdminItem {
  id: string;
  name: string;
  message: string;
  status: "pending" | "approved" | "hidden";
}

export interface EditorData {
  config: WeddingConfig;
  projectMeta: {
    name: string;
    slug: string;
    status: "draft" | "published";
    userId: string | null;
    expiredAt: string | null;
  };
  guestbookAll: GuestbookAdminItem[];
}

export async function getEditorData(projectId: string): Promise<EditorData | null> {
  const project = await fetchProjectRow({ id: projectId });
  if (!project) return null;

  return {
    config: toWeddingConfig(project),
    projectMeta: {
      name: project.name,
      slug: project.slug,
      status: project.status as "draft" | "published",
      userId: project.userId,
      expiredAt: project.expiredAt ? project.expiredAt.toISOString() : null,
    },
    guestbookAll: project.guestbook.map((g) => ({
      id: g.id,
      name: g.name,
      message: g.message,
      status: g.status as "pending" | "approved" | "hidden",
    })),
  };
}

export interface ProjectGalleryItem {
  slug: string;
  displayName: string;
  weddingDate: string;
  coverImage: string | null;
  quote: string | null;
  /** The "opening" frame's chosen variant (see openingRegistry in
   * src/motion/registry/opening-labels.ts), so the card can show off which
   * gate effect this template uses — undefined if the project has no
   * opening frame or it was never given a variant. */
  openingVariant: string | undefined;
}

/** Cards for the "/" marketing page's template gallery — published
 * projects only, newest first. */
export async function getPublishedProjectsGallery(): Promise<ProjectGalleryItem[]> {
  const projects = await prisma.project.findMany({
    where: {
      status: "published",
      // Same expiry gate as getPublishedWeddingConfigBySlug — an expired
      // project's detail page 404s, so it shouldn't be listed here either.
      OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
    },
    orderBy: { publishedAt: "desc" },
    include: {
      couple: true,
      frames: { where: { type: "opening" }, take: 1 },
    },
  });

  return projects
    .filter((p): p is typeof p & { couple: NonNullable<typeof p.couple> } => !!p.couple)
    .map((p) => {
      const openingFrame = p.frames[0];
      const openingVariant =
        openingFrame?.animation &&
        typeof openingFrame.animation === "object" &&
        "variant" in openingFrame.animation
          ? String((openingFrame.animation as { variant?: unknown }).variant ?? "") || undefined
          : undefined;

      return {
        slug: p.slug,
        displayName: p.couple.displayName,
        weddingDate: p.couple.weddingDate.toISOString(),
        coverImage: p.couple.coverImage,
        quote: p.couple.quote,
        openingVariant,
      };
    });
}

"use client";

import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import type {
  WeddingConfig,
  FrameConfig,
  FrameType,
  StoryContent,
  PhotoStackContent,
  GalleryContent,
  TimelineContent,
  TimelineItem,
  FamilyContent,
  FamilySide,
  MapContent,
  OpeningContent,
  RsvpContent,
  EventItem,
  GiftAccountItem,
} from "@/types/wedding-config";
import type { GuestbookAdminItem } from "@/lib/wedding-config";
import { WeddingRenderer } from "@/components/WeddingRenderer";
import { openingRegistry } from "@/motion/home/opening";
import { galleryRegistry } from "@/motion/registry/gallery";
import { gallery3dRegistry } from "@/motion/registry/gallery3d";
import { timelineRegistry } from "@/motion/registry/timeline";
import { typographyRegistry } from "@/motion/registry/typography";
import { transitionRegistry } from "@/motion/registry/transition";
import { ambientEffectRegistry } from "@/motion/registry/ambient";
import { backgroundPatternRegistry } from "@/motion/registry/background";
import { bowRegistry } from "@/motion/registry/bow";
import { colorThemeRegistry } from "@/motion/registry/theme";
import { saveProjectConfig, setGuestbookStatus, type SaveProjectPayload } from "./actions";
import { defaultFrameContent, DEFAULT_VARIANT } from "./defaults";
import { MediaDropzone, IMAGE_OR_VIDEO_ACCEPT, AUDIO_ACCEPT } from "./MediaDropzone";
import { sanitizeSlugInput } from "@/lib/slugify";
import {
  Field,
  TextField,
  TextAreaField,
  ToggleField,
  SmallButton,
  inputClass,
  labelClass,
  nextTempId,
} from "./Fields";

// Frame types the left panel lets you reorder / hide / add / remove.
// "opening" and "hero" stay pinned as the fixed cover block (below), and
// their content is edited alongside the couple's info instead.
const SORTABLE_TYPES: FrameType[] = [
  "story",
  "photoStack",
  "gallery",
  "timeline",
  "family",
  "events",
  "countdown",
  "map",
  "rsvp",
  "guestbook",
  "gift",
  "final",
];

type ProjectMeta = {
  name: string;
  slug: string;
  status: "draft" | "published";
  expiredAt: string | null;
};

function VariantPicker({
  registry,
  value,
  onChange,
}: {
  registry: Record<string, { label: string }>;
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(registry).map(([key, meta]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-md border px-3 py-2.5 text-left text-sm transition-all hover:-translate-y-[1px] ${
            value === key
              ? "border-accent bg-accent/5 text-accent font-medium shadow-sm ring-1 ring-accent/20"
              : "border-line text-ink-soft hover:border-ink hover:text-ink bg-transparent"
          }`}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}

function ThemeSwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(colorThemeRegistry).map(([key, theme]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-all hover:-translate-y-[1px] ${
            value === key
              ? "border-accent bg-accent/5 ring-1 ring-accent/20 shadow-sm"
              : "border-line hover:border-ink bg-transparent"
          }`}
        >
          <span
            className="flex h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-black/10"
            style={{ background: theme.colors.ivory }}
          >
            <span
              className="h-full w-1/2"
              style={{ background: theme.colors.accent }}
            />
          </span>
          <span className={value === key ? "text-ink" : "text-ink-soft"}>{theme.label}</span>
        </button>
      ))}
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  right,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-ivory shadow-flat transition-colors duration-200 ${
        open ? "border-accent" : "border-line hover:border-accent-soft"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left focus:outline-none"
        >
          <span
            className={`inline-block transition-transform duration-300 ${
              open ? "rotate-90 text-accent" : "text-ink-soft"
            }`}
          >
            ▸
          </span>
          <span className={`font-heading text-base transition-colors ${open ? "text-accent" : "text-ink"}`}>{title}</span>
        </button>
        {right}
      </div>
      {open && (
        <div className="space-y-5 border-t border-line/50 px-5 py-5">{children}</div>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-ink-soft/70">
      {children}
    </p>
  );
}

function EnabledSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink-soft group"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="min-w-[32px] text-right">{checked ? "Hiện" : "Ẩn"}</span>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="h-4 w-7 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50"></div>
        <div className="absolute left-[2px] h-3 w-3 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-3"></div>
      </div>
    </label>
  );
}

function ReorderControls({
  onUp,
  onDown,
  upDisabled,
  downDisabled,
}: {
  onUp: () => void;
  onDown: () => void;
  upDisabled: boolean;
  downDisabled: boolean;
}) {
  return (
    <span className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={onUp}
        disabled={upDisabled}
        title="Di chuyển lên"
        className="px-1.5 py-1 text-ink-soft hover:text-ink disabled:opacity-25"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={downDisabled}
        title="Di chuyển xuống"
        className="px-1.5 py-1 text-ink-soft hover:text-ink disabled:opacity-25"
      >
        ▼
      </button>
    </span>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (window.confirm("Xoá mục này khỏi trang cưới?")) onClick();
      }}
      title="Xoá mục"
      className="px-1.5 py-1 text-ink-soft hover:text-red-700"
    >
      ✕
    </button>
  );
}

function scrollSpeedLabel(pxPerSec: number): string {
  if (pxPerSec <= 30) return `${pxPerSec}px/s — rất chậm`;
  if (pxPerSec <= 55) return `${pxPerSec}px/s — chậm`;
  if (pxPerSec <= 80) return `${pxPerSec}px/s — vừa`;
  return `${pxPerSec}px/s — nhanh`;
}

const FRAME_LABELS: Record<FrameType, string> = {
  opening: "Mở đầu",
  hero: "Trang bìa",
  story: "Câu chuyện",
  photoStack: "Ảnh 3D",
  gallery: "Album ảnh",
  timeline: "Dòng thời gian",
  family: "Gia đình",
  events: "Lễ cưới",
  countdown: "Đếm ngược",
  map: "Bản đồ",
  rsvp: "RSVP",
  guestbook: "Sổ lưu bút",
  gift: "Mừng cưới",
  final: "Lời cảm ơn",
};

export function ProjectEditor({
  initialConfig,
  initialProjectMeta,
  guestbookAll,
  isProd,
  siteDomain,
  isAdmin,
}: {
  initialConfig: WeddingConfig;
  initialProjectMeta: ProjectMeta;
  guestbookAll: GuestbookAdminItem[];
  isProd: boolean;
  siteDomain: string;
  isAdmin: boolean;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [projectMeta, setProjectMeta] = useState(initialProjectMeta);
  const [guestbook, setGuestbook] = useState(guestbookAll);
  const [openId, setOpenId] = useState<string | null>("meta");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Role-independent — just "is this date in the past", used for display.
  // `isExpired` below (role-gated) is what actually locks the Save button.
  const isPastExpiry =
    !!projectMeta.expiredAt && new Date(projectMeta.expiredAt).getTime() < Date.now();

  // Non-admin owner past expiry: view-only. Checked again server-side in
  // saveProjectConfig regardless of this — see editor/actions.ts.
  const isExpired = !isAdmin && isPastExpiry;

  // In prod each project is served off its own subdomain — see lib/site.ts.
  // "Mở web"/"Copy link" need an absolute URL in that case (a relative path
  // would open /wedding/slug on the admin's own domain instead), whereas
  // dev has no subdomain DNS/SSL set up so it stays path-based.
  const publicPath = isProd
    ? `https://${projectMeta.slug}.${siteDomain}`
    : `/wedding/${projectMeta.slug}`;

  function handleCopyLink() {
    const url = publicPath.startsWith("http")
      ? publicPath
      : `${window.location.origin}${publicPath}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function focusPreview(frameId: string) {
    const container = previewRef.current;
    const el = container?.querySelector<HTMLElement>(`#frame-${frameId}`);
    if (!container || !el) return;
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    container.scrollTo({ top: Math.max(top - 12, 0), behavior: "smooth" });
  }

  // Opening a section on the left scrolls the always-visible preview on the
  // right to that section, so it's obvious what you're about to edit.
  function toggle(id: string, focusFrameId?: string) {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen && focusFrameId) focusPreview(focusFrameId);
  }

  function markDirty() {
    setSaved(false);
  }

  function frameByType(type: FrameType): FrameConfig | undefined {
    return config.frames.find((f) => f.type === type);
  }

  function updateFrame(id: string, patch: Partial<Pick<FrameConfig, "enabled" | "variant">>) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      frames: prev.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  }

  // Switching to a variant with a different content height can leave the
  // preview scrolled past the end of the (now shorter) section — re-anchor
  // to the section's top on every variant pick, not just when it's opened.
  function selectVariant(frameId: string, variant: string) {
    updateFrame(frameId, { variant });
    focusPreview(frameId);
  }

  function updateFrameContent<T>(id: string, content: T) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      frames: prev.frames.map((f) => (f.id === id ? { ...f, content } : f)),
    }));
  }

  function updateCouple(patch: Partial<WeddingConfig["couple"]>) {
    markDirty();
    setConfig((prev) => ({ ...prev, couple: { ...prev.couple, ...patch } }));
  }

  function updateTypography(variant: string) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, typographyVariant: variant },
    }));
    if (hero) focusPreview(hero.id);
  }

  function updateMusic(patch: Partial<WeddingConfig["settings"]["music"]>) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, music: { ...prev.settings.music, ...patch } },
    }));
  }

  function updateTransition(variant: string) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, transitionVariant: variant },
    }));
  }

  function updateAmbientEffect(variant: string) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, ambientEffect: variant },
    }));
  }

  function updateIntroSequence(
    patch: Partial<WeddingConfig["settings"]["introSequence"]>
  ) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        introSequence: { ...prev.settings.introSequence, ...patch },
      },
    }));
  }

  function updateColorTheme(theme: string) {
    markDirty();
    setConfig((prev) => ({ ...prev, settings: { ...prev.settings, colorTheme: theme } }));
  }

  function updateBackground(patch: Partial<WeddingConfig["settings"]["background"]>) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, background: { ...prev.settings.background, ...patch } },
    }));
  }

  function updateBowStyle(bowStyle: string) {
    markDirty();
    setConfig((prev) => ({ ...prev, settings: { ...prev.settings, bowStyle } }));
  }

  function setEvents(events: EventItem[]) {
    markDirty();
    setConfig((prev) => ({ ...prev, events }));
  }

  function setGifts(gifts: GiftAccountItem[]) {
    markDirty();
    setConfig((prev) => ({ ...prev, gifts }));
  }

  const sortableFrames = config.frames.filter(
    (f) => f.type !== "opening" && f.type !== "hero"
  );

  function setSortableFrames(next: FrameConfig[]) {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      frames: [
        ...prev.frames.filter((f) => f.type === "opening" || f.type === "hero"),
        ...next,
      ],
    }));
  }

  function moveFrame(id: string, direction: -1 | 1) {
    const list = [...sortableFrames];
    const i = list.findIndex((f) => f.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setSortableFrames(list);
  }

  function removeFrame(id: string) {
    setSortableFrames(sortableFrames.filter((f) => f.id !== id));
    if (openId === id) setOpenId(null);
  }

  function addFrame(type: FrameType) {
    const id = nextTempId(type);
    const newFrame: FrameConfig = {
      id,
      type,
      order: 0,
      enabled: true,
      variant: DEFAULT_VARIANT[type],
      content: defaultFrameContent(type),
    };
    setSortableFrames([...sortableFrames, newFrame]);
    setOpenId(id);
  }

  function handleGuestbookStatus(entryId: string, status: "approved" | "hidden") {
    setGuestbook((prev) => prev.map((g) => (g.id === entryId ? { ...g, status } : g)));
    startTransition(async () => {
      await setGuestbookStatus(config.projectId, entryId, status);
    });
  }

  const payload = useMemo<SaveProjectPayload>(
    () => ({
      project: projectMeta,
      couple: config.couple,
      frames: config.frames.map((f) => ({
        id: f.id,
        type: f.type,
        enabled: f.enabled,
        variant: f.variant,
        content: f.content,
      })),
      events: config.events,
      gifts: config.gifts,
      settings: config.settings,
    }),
    [projectMeta, config]
  );

  function handleSave() {
    startTransition(async () => {
      await saveProjectConfig(config.projectId, payload);
      setSaved(true);
    });
  }

  const opening = frameByType("opening");
  const hero = frameByType("hero");
  const availableTypes = SORTABLE_TYPES.filter(
    (t) => !sortableFrames.some((f) => f.type === t)
  );

  function renderFrameFields(frame: FrameConfig): ReactNode {
    switch (frame.type) {
      case "story":
        return (
          <StorySection
            projectId={config.projectId}
            content={frame.content as StoryContent}
            onChange={(c) => updateFrameContent(frame.id, c)}
          />
        );
      case "photoStack":
        return (
          <>
            <PhotoStackSection
              projectId={config.projectId}
              content={frame.content as PhotoStackContent}
              onChange={(c) => updateFrameContent(frame.id, c)}
            />
            <div className="pt-2">
              <p className={labelClass}>Kiểu Gallery 3D</p>
              <VariantPicker
                registry={gallery3dRegistry}
                value={frame.variant ?? "floatingPhotos"}
                onChange={(v) => selectVariant(frame.id, v)}
              />
            </div>
          </>
        );
      case "gallery":
        return (
          <>
            <GallerySection
              projectId={config.projectId}
              content={frame.content as GalleryContent}
              onChange={(c) => updateFrameContent(frame.id, c)}
            />
            <div className="pt-2">
              <p className={labelClass}>Kiểu album ảnh</p>
              <VariantPicker
                registry={galleryRegistry}
                value={frame.variant ?? "masonry"}
                onChange={(v) => selectVariant(frame.id, v)}
              />
            </div>
          </>
        );
      case "timeline":
        return (
          <>
            <TimelineSection
              content={frame.content as TimelineContent}
              onChange={(c) => updateFrameContent(frame.id, c)}
            />
            <div className="pt-2">
              <p className={labelClass}>Kiểu dòng thời gian</p>
              <VariantPicker
                registry={timelineRegistry}
                value={frame.variant ?? "alternating"}
                onChange={(v) => selectVariant(frame.id, v)}
              />
            </div>
          </>
        );
      case "family":
        return (
          <FamilySection
            content={frame.content as FamilyContent}
            onChange={(c) => updateFrameContent(frame.id, c)}
          />
        );
      case "events":
        return <EventsSection events={config.events} onChange={setEvents} />;
      case "countdown":
        return (
          <p className="text-sm text-ink-soft">
            Đếm ngược tự động tính theo ngày cưới ở mục {FRAME_LABELS.hero}.
          </p>
        );
      case "map":
        return (
          <MapSection
            content={frame.content as MapContent}
            onChange={(c) => updateFrameContent(frame.id, c)}
          />
        );
      case "rsvp":
        return (
          <RsvpSection
            content={frame.content as RsvpContent}
            onChange={(c) => updateFrameContent(frame.id, c)}
          />
        );
      case "guestbook":
        return <GuestbookSection items={guestbook} onModerate={handleGuestbookStatus} />;
      case "gift":
        return <GiftSection gifts={config.gifts} onChange={setGifts} />;
      case "final":
        return (
          <p className="text-sm text-ink-soft">
            Trang cảm ơn dùng chung tên hiển thị và ảnh bìa ở mục {FRAME_LABELS.hero}.
          </p>
        );
      default:
        return null;
    }
  }

  return (
    // Fixed, viewport-locked shell: the page itself never scrolls — only the
    // two panels below scroll independently within their own bounded height.
    // (This also covers the dashboard layout's own header/padding sitting
    // behind it, so the editor gets the full viewport regardless of that
    // shared chrome.)
    <div className="fixed inset-0 z-10 flex flex-col bg-ivory-deep">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-line bg-ivory px-6 py-4 md:px-10">
        <div>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            ← Danh sách dự án
          </Link>
          <h1 className="font-heading text-xl italic text-ink">
            {projectMeta.name}
          </h1>
          {projectMeta.expiredAt && (
            <p
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                isPastExpiry
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-accent-soft bg-accent-soft/15 text-accent"
              }`}
            >
              <span aria-hidden>⏳</span>
              Hạn sử dụng:{" "}
              {new Date(projectMeta.expiredAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isPastExpiry && " — đã hết hạn"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap border border-line px-4 py-2.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Mở web
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="whitespace-nowrap border border-line px-4 py-2.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {copied ? "Đã copy ✓" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || isExpired}
            title={isExpired ? "Dự án đã hết hạn sử dụng — liên hệ admin để gia hạn" : undefined}
            className="border border-ink bg-ink px-6 py-2.5 text-xs uppercase tracking-widest text-ivory transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {isPending ? "Đang lưu..." : saved ? "Đã lưu ✓" : "Lưu tất cả thay đổi"}
          </button>
        </div>
      </header>

      {isExpired && (
        <div className="flex-shrink-0 border-b border-line bg-red-50 px-6 py-2.5 text-center text-xs text-red-700 md:px-10">
          Dự án đã hết hạn sử dụng — bạn chỉ có thể xem, không thể lưu thay đổi. Liên hệ admin để gia hạn.
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-6 p-6 md:grid-cols-[420px_1fr] md:p-10">
        {/* LEFT: every setting, grouped into "cài đặt chung" vs "section trang cưới" */}
        <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
          <GroupLabel>Cài đặt chung</GroupLabel>
          <Accordion title="Dự án" open={openId === "meta"} onToggle={() => toggle("meta")}>
            <TextField
              label="Tên dự án"
              value={projectMeta.name}
              onChange={(v) => {
                markDirty();
                setProjectMeta((p) => ({ ...p, name: v }));
              }}
            />
            <TextField
              label="Slug (đường dẫn)"
              value={projectMeta.slug}
              onChange={(v) => {
                markDirty();
                setProjectMeta((p) => ({ ...p, slug: sanitizeSlugInput(v) }));
              }}
            />
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft/80">
              Slug dùng làm địa chỉ subdomain riêng của thiệp (VD:{" "}
              <span className="text-ink">minh-linh</span>.motdoi.click) — chỉ
              gồm chữ cái không dấu, số và dấu gạch ngang, không dùng tiếng
              Việt có dấu hay khoảng trắng.
            </p>
            <Field label="Trạng thái">
              <select
                value={projectMeta.status}
                onChange={(e) => {
                  markDirty();
                  setProjectMeta((p) => ({
                    ...p,
                    status: e.target.value as "draft" | "published",
                  }));
                }}
                className={inputClass}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </Field>
            {isAdmin && (
              <>
                <TextField
                  label="Hạn sử dụng (admin)"
                  type="datetime-local"
                  value={projectMeta.expiredAt ? projectMeta.expiredAt.slice(0, 16) : ""}
                  onChange={(v) => {
                    markDirty();
                    setProjectMeta((p) => ({
                      ...p,
                      expiredAt: v ? new Date(v).toISOString() : null,
                    }));
                  }}
                />
                <p className="mt-1 text-xs text-ink-soft">
                  Sau ngày này, chủ dự án (nếu không phải admin) chỉ xem
                  được, không lưu được thay đổi. Để trống = không giới hạn.
                </p>
              </>
            )}
          </Accordion>

          {opening && (
            <Accordion
              title="Màn hình mở đầu"
              open={openId === "opening"}
              onToggle={() => toggle("opening")}
            >
              <div>
                <p className={labelClass}>Hiệu ứng mở đầu</p>
                <VariantPicker
                  registry={openingRegistry}
                  value={opening.variant ?? "particleBloom"}
                  onChange={(v) => selectVariant(opening.id, v)}
                />
              </div>
              <ToggleField
                label="Hiển thị đếm ngược trên màn mở đầu"
                checked={(opening.content as Partial<OpeningContent>)?.showCountdown ?? false}
                onChange={(v) =>
                  updateFrameContent(opening.id, {
                    ...(opening.content as object),
                    showCountdown: v,
                  })
                }
              />
            </Accordion>
          )}

          <Accordion title="Nhạc nền" open={openId === "music"} onToggle={() => toggle("music")}>
            <ToggleField
              label="Bật nhạc nền"
              checked={config.settings.music.enabled}
              onChange={(v) => updateMusic({ enabled: v })}
            />
            <ToggleField
              label="Tự động phát"
              checked={config.settings.music.autoplay}
              onChange={(v) => updateMusic({ autoplay: v })}
            />
            <ToggleField
              label="Lặp lại"
              checked={config.settings.music.loop}
              onChange={(v) => updateMusic({ loop: v })}
            />
            <div>
              <p className={labelClass}>File nhạc nền</p>
              <MediaDropzone
                projectId={config.projectId}
                items={config.settings.music.assetUrl ? [config.settings.music.assetUrl] : []}
                onChange={(urls) => updateMusic({ assetUrl: urls[0] ?? "" })}
                multiple={false}
                accept={AUDIO_ACCEPT}
                formatsLabel="MP3, WAV, M4A"
                dropLabel="Kéo thả file nhạc vào đây hoặc nhấp để chọn"
              />
            </div>
            <Field label={`Âm lượng (${Math.round(config.settings.music.volume * 100)}%)`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={config.settings.music.volume}
                onChange={(e) => updateMusic({ volume: Number(e.target.value) })}
                className="w-full"
              />
            </Field>
          </Accordion>

          <Accordion
            title="Hiệu ứng đặc biệt"
            open={openId === "effects"}
            onToggle={() => toggle("effects")}
          >
            <div>
              <p className={labelClass}>Hiệu ứng nền toàn trang</p>
              <VariantPicker
                registry={ambientEffectRegistry}
                value={config.settings.ambientEffect}
                onChange={updateAmbientEffect}
              />
            </div>
            <div className="pt-2">
              <p className={labelClass}>Chuyển cảnh giữa các section</p>
              <VariantPicker
                registry={transitionRegistry}
                value={config.settings.transitionVariant}
                onChange={updateTransition}
              />
            </div>

            <div className="space-y-3 border-t border-line pt-4">
              <ToggleField
                label="Tự động dẫn dắt khi mở"
                checked={config.settings.introSequence.enabled}
                onChange={(v) => updateIntroSequence({ enabled: v })}
              />
              <p className="text-xs text-ink-soft">
                Chạm mở thiệp luôn có hiệu ứng tung hoa bùng mạnh vài giây.
                Bật thêm mục này để sau đó trang tự cuộn chậm từ đầu xuống
                cuối — khách cuộn tay lúc nào cũng dừng lại ngay lúc đó.
              </p>
              {config.settings.introSequence.enabled && (
                <Field label={`Tốc độ cuộn tự động (${scrollSpeedLabel(config.settings.introSequence.scrollSpeed)})`}>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    step={5}
                    value={config.settings.introSequence.scrollSpeed}
                    onChange={(e) =>
                      updateIntroSequence({ scrollSpeed: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </Field>
              )}
            </div>
          </Accordion>

          <Accordion
            title="Giao diện màu sắc & Nền"
            open={openId === "background"}
            onToggle={() => toggle("background")}
          >
            <div>
              <p className={labelClass}>Bảng màu chủ đạo</p>
              <ThemeSwatchPicker
                value={config.settings.colorTheme}
                onChange={updateColorTheme}
              />
            </div>

            <div className="pt-2">
              <p className={labelClass}>Nền trang</p>
              <div className="flex items-center gap-3">
                <SmallButton
                  tone={config.settings.background.mode === "solid" ? "accent" : "default"}
                  onClick={() => updateBackground({ mode: "solid" })}
                >
                  Màu trơn
                </SmallButton>
                <SmallButton
                  tone={config.settings.background.mode === "pattern" ? "accent" : "default"}
                  onClick={() => updateBackground({ mode: "pattern" })}
                >
                  Hoạ tiết
                </SmallButton>
              </div>
            </div>
            {config.settings.background.mode === "pattern" && (
              <div>
                <p className={labelClass}>Kiểu hoạ tiết</p>
                <VariantPicker
                  registry={backgroundPatternRegistry}
                  value={config.settings.background.pattern}
                  onChange={(v) => updateBackground({ pattern: v })}
                />
              </div>
            )}

            <div className="border-t border-line pt-4">
              <p className={labelClass}>Nơ trang trí (Trang bìa & Câu chuyện)</p>
              <VariantPicker
                registry={bowRegistry}
                value={config.settings.bowStyle}
                onChange={updateBowStyle}
              />
            </div>
          </Accordion>

          <GroupLabel>Section trang cưới</GroupLabel>

          {opening && hero && (
            <Accordion
              title={`${FRAME_LABELS.opening} & ${FRAME_LABELS.hero}`}
              open={openId === "hero"}
              onToggle={() => toggle("hero", hero.id)}
              right={
                <EnabledSwitch
                  checked={opening.enabled}
                  onChange={(v) => updateFrame(opening.id, { enabled: v })}
                />
              }
            >
              <TextField
                label="Tên chú rể"
                value={config.couple.groomName}
                onChange={(v) => updateCouple({ groomName: v })}
              />
              <TextField
                label="Tên cô dâu"
                value={config.couple.brideName}
                onChange={(v) => updateCouple({ brideName: v })}
              />
              <TextField
                label="Tên hiển thị"
                value={config.couple.displayName}
                onChange={(v) => updateCouple({ displayName: v })}
              />
              <TextField
                label="Ngày cưới"
                type="datetime-local"
                value={config.couple.weddingDate.slice(0, 16)}
                onChange={(v) => updateCouple({ weddingDate: new Date(v).toISOString() })}
              />
              <TextField
                label="Ngày âm lịch (hiển thị)"
                value={config.couple.weddingDateLunar ?? ""}
                onChange={(v) => updateCouple({ weddingDateLunar: v })}
              />
              <div>
                <p className={labelClass}>Ảnh bìa (hoặc video nền)</p>
                <MediaDropzone
                  projectId={config.projectId}
                  items={config.couple.coverImage ? [config.couple.coverImage] : []}
                  onChange={(urls) => updateCouple({ coverImage: urls[0] ?? "" })}
                  multiple={false}
                  accept={IMAGE_OR_VIDEO_ACCEPT}
                  formatsLabel="JPG, PNG, WEBP, GIF, MP4, MOV, WEBM"
                />
              </div>
              <TextAreaField
                label="Câu trích dẫn"
                value={config.couple.quote ?? ""}
                onChange={(v) => updateCouple({ quote: v })}
                rows={2}
              />
              <div className="pt-2">
                <p className={labelClass}>Kiểu chữ tiêu đề (toàn trang)</p>
                <VariantPicker
                  registry={typographyRegistry}
                  value={config.settings.typographyVariant}
                  onChange={updateTypography}
                />
              </div>
            </Accordion>
          )}

          {sortableFrames.map((frame, i) => (
            <Accordion
              key={frame.id}
              title={FRAME_LABELS[frame.type]}
              open={openId === frame.id}
              onToggle={() => toggle(frame.id, frame.id)}
              right={
                <div className="flex items-center gap-2">
                  <ReorderControls
                    onUp={() => moveFrame(frame.id, -1)}
                    onDown={() => moveFrame(frame.id, 1)}
                    upDisabled={i === 0}
                    downDisabled={i === sortableFrames.length - 1}
                  />
                  <EnabledSwitch
                    checked={frame.enabled}
                    onChange={(v) => updateFrame(frame.id, { enabled: v })}
                  />
                  <DeleteButton onClick={() => removeFrame(frame.id)} />
                </div>
              }
            >
              {renderFrameFields(frame)}
            </Accordion>
          ))}

          {availableTypes.length > 0 && (
            <div className="card-flat flex flex-wrap items-center gap-2 px-5 py-4">
              <span className={labelClass + " w-full"}>+ Thêm mục mới</span>
              {availableTypes.map((t) => (
                <SmallButton key={t} tone="accent" onClick={() => addFrame(t)}>
                  {FRAME_LABELS[t]}
                </SmallButton>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT: always-visible live preview, shares the exact same renderer as the public site */}
        <div
          ref={previewRef}
          className="min-h-0 overflow-y-auto border border-line bg-ivory shadow-flat"
        >
          <WeddingRenderer config={config} initialEntered />
        </div>
      </div>
    </div>
  );
}

function StorySection({
  projectId,
  content,
  onChange,
}: {
  projectId: string;
  content: StoryContent;
  onChange: (c: StoryContent) => void;
}) {
  return (
    <>
      <TextField label="Tiêu đề nhỏ" value={content.eyebrow} onChange={(v) => onChange({ ...content, eyebrow: v })} />
      <TextField label="Tiêu đề" value={content.title} onChange={(v) => onChange({ ...content, title: v })} />
      <TextAreaField
        label="Nội dung (mỗi đoạn 1 dòng)"
        rows={4}
        value={content.paragraphs.join("\n")}
        onChange={(v) => onChange({ ...content, paragraphs: v.split("\n").filter(Boolean) })}
      />
      <div>
        <p className={labelClass}>Ảnh</p>
        <MediaDropzone
          projectId={projectId}
          items={content.image ? [content.image] : []}
          onChange={(urls) => onChange({ ...content, image: urls[0] ?? "" })}
          multiple={false}
        />
      </div>
    </>
  );
}

function PhotoStackSection({
  projectId,
  content,
  onChange,
}: {
  projectId: string;
  content: PhotoStackContent;
  onChange: (c: PhotoStackContent) => void;
}) {
  return (
    <>
      <TextField label="Tiêu đề" value={content.title} onChange={(v) => onChange({ ...content, title: v })} />
      <div>
        <p className={labelClass}>Ảnh</p>
        <MediaDropzone
          projectId={projectId}
          items={content.images}
          maxItems={24}
          onChange={(urls) => onChange({ ...content, images: urls })}
        />
      </div>
    </>
  );
}

function GallerySection({
  projectId,
  content,
  onChange,
}: {
  projectId: string;
  content: GalleryContent;
  onChange: (c: GalleryContent) => void;
}) {
  return (
    <>
      <TextField label="Tiêu đề" value={content.title} onChange={(v) => onChange({ ...content, title: v })} />
      <TextField label="Mô tả" value={content.subtitle} onChange={(v) => onChange({ ...content, subtitle: v })} />
      <div>
        <p className={labelClass}>Ảnh</p>
        <MediaDropzone
          projectId={projectId}
          items={content.items}
          maxItems={16}
          onChange={(urls) => onChange({ ...content, items: urls })}
        />
      </div>
    </>
  );
}

function TimelineSection({
  content,
  onChange,
}: {
  content: TimelineContent;
  onChange: (c: TimelineContent) => void;
}) {
  function updateItem(i: number, patch: Partial<TimelineItem>) {
    const items = content.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange({ items });
  }
  function removeItem(i: number) {
    onChange({ items: content.items.filter((_, idx) => idx !== i) });
  }
  function addItem() {
    onChange({ items: [...content.items, { date: "", title: "", desc: "" }] });
  }

  return (
    <div className="space-y-4">
      {content.items.map((item, i) => (
        <div key={i} className="space-y-2 border-b border-line pb-3">
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Mốc thời gian" value={item.date} onChange={(v) => updateItem(i, { date: v })} />
            <TextField label="Tiêu đề" value={item.title} onChange={(v) => updateItem(i, { title: v })} />
          </div>
          <TextAreaField label="Mô tả" rows={2} value={item.desc} onChange={(v) => updateItem(i, { desc: v })} />
          <SmallButton tone="danger" onClick={() => removeItem(i)}>
            Xoá mốc này
          </SmallButton>
        </div>
      ))}
      <SmallButton tone="accent" onClick={addItem}>
        + Thêm mốc thời gian
      </SmallButton>
    </div>
  );
}

const EMPTY_FAMILY_MAP = { enabled: false, address: "", lat: 0, lng: 0, directionsUrl: "" };

function FamilySideFields({
  side,
  onChange,
}: {
  side: FamilySide;
  onChange: (s: FamilySide) => void;
}) {
  const map = side.map ?? EMPTY_FAMILY_MAP;
  return (
    <div className="space-y-2">
      <TextField label="Tên bố" value={side.father} onChange={(v) => onChange({ ...side, father: v })} />
      <TextField label="Tên mẹ" value={side.mother} onChange={(v) => onChange({ ...side, mother: v })} />

      <ToggleField
        label="Có địa điểm cưới riêng (bản đồ)"
        checked={map.enabled}
        onChange={(v) => onChange({ ...side, map: { ...map, enabled: v } })}
      />
      {map.enabled && (
        <div className="space-y-2 border-l-2 border-line pl-3">
          <TextField
            label="Địa chỉ"
            value={map.address}
            onChange={(v) => onChange({ ...side, map: { ...map, address: v } })}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Vĩ độ (lat)"
              type="number"
              value={String(map.lat)}
              onChange={(v) => onChange({ ...side, map: { ...map, lat: Number(v) || 0 } })}
            />
            <TextField
              label="Kinh độ (lng)"
              type="number"
              value={String(map.lng)}
              onChange={(v) => onChange({ ...side, map: { ...map, lng: Number(v) || 0 } })}
            />
          </div>
          <TextField
            label="Link Google Maps (chỉ đường)"
            value={map.directionsUrl}
            onChange={(v) => onChange({ ...side, map: { ...map, directionsUrl: v } })}
          />
        </div>
      )}
    </div>
  );
}

function FamilySection({
  content,
  onChange,
}: {
  content: FamilyContent;
  onChange: (c: FamilyContent) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className={labelClass}>Nhà trai</p>
        <FamilySideFields side={content.groom} onChange={(groom) => onChange({ ...content, groom })} />
      </div>
      <div className="space-y-2 border-t border-line pt-4">
        <p className={labelClass}>Nhà gái</p>
        <FamilySideFields side={content.bride} onChange={(bride) => onChange({ ...content, bride })} />
      </div>
    </div>
  );
}

function MapSection({
  content,
  onChange,
}: {
  content: MapContent;
  onChange: (c: MapContent) => void;
}) {
  return (
    <>
      <TextField label="Tên địa điểm" value={content.venue} onChange={(v) => onChange({ ...content, venue: v })} />
      <TextField label="Địa chỉ" value={content.address} onChange={(v) => onChange({ ...content, address: v })} />
      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="Vĩ độ (lat)"
          type="number"
          value={String(content.lat)}
          onChange={(v) => onChange({ ...content, lat: Number(v) || 0 })}
        />
        <TextField
          label="Kinh độ (lng)"
          type="number"
          value={String(content.lng)}
          onChange={(v) => onChange({ ...content, lng: Number(v) || 0 })}
        />
      </div>
      <TextField
        label="Link Google Maps (chỉ đường)"
        value={content.directionsUrl}
        onChange={(v) => onChange({ ...content, directionsUrl: v })}
      />
    </>
  );
}

function RsvpSection({
  content,
  onChange,
}: {
  content: RsvpContent;
  onChange: (c: RsvpContent) => void;
}) {
  return (
    <>
      <ToggleField
        label="Hiển thị số lượng khách"
        checked={content.showGuestCount}
        onChange={(v) => onChange({ ...content, showGuestCount: v })}
      />
      <ToggleField
        label="Hiển thị lời nhắn"
        checked={content.showMessage}
        onChange={(v) => onChange({ ...content, showMessage: v })}
      />
    </>
  );
}

function EventsSection({
  events,
  onChange,
}: {
  events: EventItem[];
  onChange: (events: EventItem[]) => void;
}) {
  function updateEvent(i: number, patch: Partial<EventItem>) {
    onChange(events.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function removeEvent(i: number) {
    onChange(events.filter((_, idx) => idx !== i));
  }
  function addEvent() {
    onChange([
      ...events,
      {
        id: nextTempId("event"),
        name: "",
        date: new Date().toISOString(),
        time: "",
        venue: "",
        address: "",
      },
    ]);
  }

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={event.id} className="space-y-2 border-b border-line pb-3">
          <TextField label="Tên lễ" value={event.name} onChange={(v) => updateEvent(i, { name: v })} />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Ngày"
              type="date"
              value={event.date.slice(0, 10)}
              onChange={(v) => updateEvent(i, { date: new Date(v).toISOString() })}
            />
            <TextField label="Giờ" value={event.time ?? ""} onChange={(v) => updateEvent(i, { time: v })} />
          </div>
          <TextField label="Địa điểm" value={event.venue} onChange={(v) => updateEvent(i, { venue: v })} />
          <TextField
            label="Địa chỉ"
            value={event.address ?? ""}
            onChange={(v) => updateEvent(i, { address: v })}
          />
          <SmallButton tone="danger" onClick={() => removeEvent(i)}>
            Xoá lễ này
          </SmallButton>
        </div>
      ))}
      <SmallButton tone="accent" onClick={addEvent}>
        + Thêm lễ
      </SmallButton>
    </div>
  );
}

function GiftSection({
  gifts,
  onChange,
}: {
  gifts: GiftAccountItem[];
  onChange: (gifts: GiftAccountItem[]) => void;
}) {
  function updateGift(i: number, patch: Partial<GiftAccountItem>) {
    onChange(gifts.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function removeGift(i: number) {
    onChange(gifts.filter((_, idx) => idx !== i));
  }
  function addGift() {
    onChange([
      ...gifts,
      { id: nextTempId("gift"), label: "", bank: "", accountName: "", accountNumber: "" },
    ]);
  }

  return (
    <div className="space-y-4">
      {gifts.map((gift, i) => (
        <div key={gift.id} className="space-y-2 border-b border-line pb-3">
          <TextField label="Nhãn (VD: Chú rể)" value={gift.label} onChange={(v) => updateGift(i, { label: v })} />
          <TextField label="Ngân hàng" value={gift.bank} onChange={(v) => updateGift(i, { bank: v })} />
          <TextField
            label="Tên chủ tài khoản"
            value={gift.accountName}
            onChange={(v) => updateGift(i, { accountName: v })}
          />
          <TextField
            label="Số tài khoản"
            value={gift.accountNumber}
            onChange={(v) => updateGift(i, { accountNumber: v })}
          />
          <SmallButton tone="danger" onClick={() => removeGift(i)}>
            Xoá
          </SmallButton>
        </div>
      ))}
      <SmallButton tone="accent" onClick={addGift}>
        + Thêm tài khoản
      </SmallButton>
    </div>
  );
}

function GuestbookSection({
  items,
  onModerate,
}: {
  items: GuestbookAdminItem[];
  onModerate: (id: string, status: "approved" | "hidden") => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-soft">Chưa có lời chúc nào.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((entry) => (
        <div key={entry.id} className="flex items-start justify-between gap-3 border-b border-line pb-3">
          <div>
            <p className="font-heading italic text-ink">{entry.name}</p>
            <p className="text-sm text-ink-soft">{entry.message}</p>
            <span className="mt-1 inline-block text-xs uppercase tracking-widest text-accent">
              {entry.status}
            </span>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <SmallButton onClick={() => onModerate(entry.id, "approved")}>Duyệt</SmallButton>
            <SmallButton tone="danger" onClick={() => onModerate(entry.id, "hidden")}>
              Ẩn
            </SmallButton>
          </div>
        </div>
      ))}
    </div>
  );
}

// The single serializable shape that both the public wedding page and the
// admin editor's live preview render from — this is what keeps them from
// ever drifting apart. Built once in src/lib/wedding-config.ts from Prisma
// rows, then handed to <WeddingRenderer config={...} /> either way.

export type FrameType =
  | "opening"
  | "hero"
  | "story"
  | "photoStack"
  | "gallery"
  | "timeline"
  | "family"
  | "events"
  | "countdown"
  | "map"
  | "rsvp"
  | "guestbook"
  | "gift"
  | "final";

export interface CoupleInfo {
  groomName: string;
  brideName: string;
  displayName: string;
  weddingDate: string;
  weddingDateLunar: string | null;
  coverImage: string | null;
  quote: string | null;
}

export interface OpeningContent {
  /** Shows a compact days/hours/minutes/seconds countdown on the tap-to-enter
   * gate screen itself, above the "Chạm để mở" button. */
  showCountdown: boolean;
}

export interface StoryContent {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  image: string;
}

export interface PhotoStackContent {
  title: string;
  images: string[];
}

export interface GalleryContent {
  title: string;
  subtitle: string;
  items: string[];
}

export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
}

export interface TimelineContent {
  items: TimelineItem[];
}

export interface FamilySideMap {
  enabled: boolean;
  address: string;
  lat: number;
  lng: number;
  directionsUrl: string;
}

export interface FamilySide {
  title: string;
  father: string;
  mother: string;
  /** Optional per-side venue map — for couples whose two families hold
   * separate ceremonies rather than sharing one lễ đường. */
  map?: FamilySideMap;
}

export interface FamilyContent {
  groom: FamilySide;
  bride: FamilySide;
}

export interface MapContent {
  venue: string;
  address: string;
  lat: number;
  lng: number;
  directionsUrl: string;
}

export interface RsvpContent {
  showGuestCount: boolean;
  showMessage: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string | null;
  venue: string;
  address: string | null;
}

export interface GiftAccountItem {
  id: string;
  label: string;
  bank: string;
  accountName: string;
  accountNumber: string;
}

export interface GuestbookItem {
  id: string;
  name: string;
  message: string;
}

export interface FrameConfig<TContent = unknown> {
  id: string;
  type: FrameType;
  order: number;
  enabled: boolean;
  variant?: string;
  content: TContent;
}

export interface MusicSettings {
  enabled: boolean;
  assetUrl: string;
  autoplay: boolean;
  loop: boolean;
  volume: number;
}

export interface IntroSequenceSettings {
  /** When the guest taps "Chạm để mở": a heavy petal burst plays over the
   * Hero, then after a short pause the page auto-scrolls top → bottom as a
   * guided cinematic tour. Cancels the instant the guest scrolls/touches. */
  enabled: boolean;
  /** Pixels per second, not a fixed total duration — a fixed duration made
   * the tour race through longer pages and crawl on short ones. A constant
   * speed keeps the same slow, cinematic pace regardless of page length. */
  scrollSpeed: number;
}

export interface BackgroundSettings {
  /** "solid" just paints the active colour theme's ivory tone; "pattern"
   * layers a subtle CSS-generated texture on top of it (see
   * src/motion/registry/background.tsx), tinted from that same theme —
   * never a free-picked colour, so it can never clash or go unreadable. */
  mode: "solid" | "pattern";
  pattern: string;
}

export interface ProjectSettings {
  typographyVariant: string;
  music: MusicSettings;
  /** Scroll-driven blur/fade dissolve between sections — see
   * src/motion/registry/transition.tsx for the variant list. */
  transitionVariant: string;
  /** Full-page decorative overlay (falling petals, bokeh, sparkle...) — see
   * src/motion/registry/ambient.tsx for the variant list. */
  ambientEffect: string;
  introSequence: IntroSequenceSettings;
  /** Coordinated colour palette (ivory/ink/accent/line/gold) — see
   * src/motion/registry/theme.tsx. Overrides the CSS custom properties that
   * every `bg-ivory`/`text-ink`/`border-line`/etc. utility already reads,
   * so text contrast is always guaranteed by the preset, never hand-picked. */
  colorTheme: string;
  background: BackgroundSettings;
  /** A small decorative bow ornament, centred under the couple's names on
   * the cover and above the story's title — see src/motion/registry/bow.tsx.
   * Purely a flourish to soften an otherwise plain stretch; "none" by
   * default so it stays fully opt-in. */
  bowStyle: string;
}

export const defaultProjectSettings: ProjectSettings = {
  typographyVariant: "wordReveal",
  music: {
    enabled: true,
    assetUrl: "/audio/wedding-theme.mp3",
    autoplay: true,
    loop: true,
    volume: 0.6,
  },
  transitionVariant: "none",
  ambientEffect: "none",
  introSequence: {
    enabled: false,
    scrollSpeed: 40,
  },
  colorTheme: "classic",
  background: {
    mode: "solid",
    pattern: "dots",
  },
  bowStyle: "none",
};

export interface WeddingConfig {
  projectId: string;
  slug: string;
  couple: CoupleInfo;
  frames: FrameConfig[];
  events: EventItem[];
  gifts: GiftAccountItem[];
  guestbook: GuestbookItem[];
  settings: ProjectSettings;
}

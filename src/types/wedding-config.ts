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
  | "schedule"
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

export type ScheduleIconKey =
  | "car"
  | "home"
  | "rings"
  | "camera"
  | "heart"
  | "gift"
  | "clock"
  | "mapPin";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  icon: ScheduleIconKey;
}

export interface ScheduleContent {
  items: ScheduleItem[];
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
  /** Two confetti cannons firing from the bottom corners in periodic waves
   * — see ConfettiCannon in src/motion/registry/ambient.tsx. A standalone
   * on/off layer, not one more choice inside `ambientEffect`'s single-select
   * — it can run stacked on top of whichever ambientEffect is also chosen. */
  confettiCannon: boolean;
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
  /** Where the live guestbook-wishes stream (LiveWishesOverlay) sits.
   * "default" keeps it exactly where it's always been — drifting over the
   * Hero photo only, scrolling away with it like the rest of that section.
   * "bottomLeft"/"bottomRight" instead pin it `fixed` to a screen corner,
   * visible the whole time the guest scrolls — the TikTok-live-comments
   * look — independent of which frame is currently in view. */
  chatPosition: string;
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
  // "none" felt like sections snapping into place with nothing connecting
  // them — the fade/blur dissolve is subtle enough not to slow scrolling
  // down but gives adjacent sections a soft handoff instead. Still fully
  // opt-out per project via the "Chuyển cảnh" setting.
  transitionVariant: "fadeBlur",
  ambientEffect: "none",
  confettiCannon: false,
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
  chatPosition: "default",
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

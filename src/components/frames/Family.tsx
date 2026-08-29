import type { CoupleInfo, EventItem, FamilyContent, FamilySide } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { FloralOrnament, LeafyCorner, BalloonCluster, DaisyCluster } from "@/motion/registry/family";
import { MapModalButton } from "@/components/MapModalButton";

/** "09h00" style, matching the "Xh00" time notation already used on the
 * traditional printed-invitation reference. Always derived from
 * `couple.weddingDate`'s own time-of-day — never `event.time` (a separate
 * free-text field on the ceremony schedule) — so editing the wedding
 * date's time in the admin editor is what actually changes what's shown
 * here, instead of a same-looking but disconnected field silently
 * overriding it. */
function formatCeremonyTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}h${String(date.getMinutes()).padStart(2, "0")}`;
}

/** One family side's own venue map — for couples whose two families hold
 * separate ceremonies rather than sharing one lễ đường (FamilySideMap.enabled).
 * Compact treatment (small embed, no full Section chrome) to fit inside the
 * card-styled variants below. */
function FamilySideMapBlock({ side }: { side: FamilySide }) {
  const map = side.map;
  if (!map?.enabled) return null;

  return (
    <div className="mt-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
        {side.title}
      </p>
      {map.address && (
        <p className="mt-1 font-serif text-xs text-ink-soft">{map.address}</p>
      )}
      <MapModalButton
        title={side.title}
        lat={map.lat}
        lng={map.lng}
        directionsUrl={map.directionsUrl}
        className="mt-2 inline-flex items-center gap-1.5 border border-line px-4 py-1.5 text-[11px] uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
      />
    </div>
  );
}

/** The shared text content of a formal "thiệp báo hỷ" — parents under
 * NHÀ TRAI / NHÀ GÁI, the couple's full names centred beneath the
 * announcement line, ceremony time/venue pulled from the first lễ cưới
 * event (same source Events.tsx reads from). Falls back gracefully when
 * there's no event yet — just omits that block rather than showing blanks.
 * Shared by both card-styled variants below; only the border/ornaments
 * around it differ. */
function AnnouncementBody({
  content,
  couple,
  event,
}: {
  content: FamilyContent;
  couple: CoupleInfo;
  event?: EventItem;
}) {
  // Always couple.weddingDate — the same source of truth as the cover
  // page/Opening gate, never event.date. `event` is the *first* item of a
  // separately-editable ceremony schedule (frame-registry.tsx passes
  // ctx.events[0]), which can be a different date entirely (a second
  // ceremony, a reception, or just edited out of sync) — that mismatch is
  // what showed a wrong date/weekday here while the cover page printed the
  // right one. `event` is still used for what couple.weddingDate doesn't
  // carry: time, venue, address.
  const ceremonyDate = new Date(couple.weddingDate);
  const weekday = ceremonyDate.toLocaleDateString("vi-VN", { weekday: "long" });
  const dateStr = ceremonyDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.15em] text-ink-soft">
        <div>
          <p className="font-semibold text-accent">{content.groom.title}</p>
          <p className="mt-2 font-serif text-sm normal-case text-ink">{content.groom.father}</p>
          <p className="font-serif text-sm normal-case text-ink">{content.groom.mother}</p>
        </div>
        <div>
          <p className="font-semibold text-accent">{content.bride.title}</p>
          <p className="mt-2 font-serif text-sm normal-case text-ink">{content.bride.father}</p>
          <p className="font-serif text-sm normal-case text-ink">{content.bride.mother}</p>
        </div>
      </div>

      {(content.groom.map?.enabled || content.bride.map?.enabled) && (
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <FamilySideMapBlock side={content.groom} />
          <FamilySideMapBlock side={content.bride} />
        </div>
      )}

      <div className="mx-auto my-8 h-px w-16 bg-line" />

      <p className="text-xs uppercase tracking-[0.35em] text-accent">Trân trọng báo tin</p>
      <p className="mt-1 font-serif text-sm uppercase tracking-widest text-ink-soft">
        Lễ thành hôn của con chúng tôi
      </p>

      <p className="mt-6 font-heading text-3xl italic text-ink md:text-4xl">
        {couple.groomName}
      </p>
      <p className="font-script text-2xl text-accent">&amp;</p>
      <p className="font-heading text-3xl italic text-ink md:text-4xl">{couple.brideName}</p>

      <div className="mx-auto my-8 h-px w-16 bg-line" />
      <p className="font-serif text-sm text-ink-soft">Được cử hành vào lúc</p>
      <p className="mt-1 font-heading text-xl text-ink">
        {formatCeremonyTime(ceremonyDate)} — {weekday}, {dateStr}
      </p>
      {couple.weddingDateLunar && (
        <p className="mt-1 text-xs text-ink-soft">({couple.weddingDateLunar})</p>
      )}
      {event?.venue && <p className="mt-6 font-serif text-lg text-ink">Tại {event.venue}</p>}
      {event?.address && <p className="text-sm text-ink-soft">{event.address}</p>}
    </>
  );
}

function InvitationFamily(props: { content: FamilyContent; couple: CoupleInfo; event?: EventItem }) {
  return (
    <Reveal preset="fadeUp" className="mx-auto mt-12 max-w-lg">
      <div className="relative overflow-hidden border border-accent-soft/70 bg-ivory px-6 py-14 text-center sm:px-12">
        <FloralOrnament className="pointer-events-none absolute -left-2 -top-2 h-24 w-24 text-gold/60" />
        <FloralOrnament className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 text-gold/60 [transform:scaleX(-1)]" />
        <AnnouncementBody {...props} />
      </div>
    </Reveal>
  );
}

/** Greenery/eucalyptus invitation style — leaf clusters in the top corners
 * plus thin gold mitred corner accents (bottom-left / top-right), matching
 * the popular "botanical" printed-invitation look. */
function BotanicalFamily(props: { content: FamilyContent; couple: CoupleInfo; event?: EventItem }) {
  return (
    <Reveal preset="fadeUp" className="mx-auto mt-12 max-w-lg">
      <div className="relative overflow-hidden border border-gold/40 bg-ivory px-6 py-14 text-center sm:px-12">
        <LeafyCorner className="pointer-events-none absolute -left-4 -top-4 h-40 w-40" />
        <LeafyCorner className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 [transform:scaleX(-1)]" />
        <LeafyCorner className="pointer-events-none absolute -bottom-8 -right-6 h-32 w-32 rotate-180 opacity-90" />
        <LeafyCorner className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rotate-180 opacity-70 [transform:rotate(180deg)_scaleX(-1)]" />

        {/* Thin mitred gold corner lines, opposite the leaf clusters. */}
        <span className="pointer-events-none absolute right-6 top-6 h-10 w-10 border-r-2 border-t-2 border-gold/70" />
        <span className="pointer-events-none absolute bottom-6 left-6 h-10 w-10 border-b-2 border-l-2 border-gold/70" />

        <AnnouncementBody {...props} />
      </div>
    </Reveal>
  );
}

type AnnouncementProps = { content: FamilyContent; couple: CoupleInfo; event?: EventItem };

/** Soft watercolour wash blobs + scattered gold flecks, no hard border —
 * airy modern-Western invitation look. Blobs use `accent-soft`/`gold` CSS
 * vars (blurred, low opacity) so the wash tint always matches the active
 * colour theme instead of being a fixed pink. */
function WatercolorFamily(props: AnnouncementProps) {
  return (
    <Reveal
      preset="fadeUp"
      className="relative mx-auto mt-12 max-w-lg overflow-hidden bg-ivory px-6 py-16 text-center sm:px-12"
    >
      <div className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-accent-soft/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 top-1/3 h-56 w-56 rounded-full bg-accent-soft/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/4 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
      <span className="pointer-events-none absolute left-10 top-12 h-1.5 w-1.5 rounded-full bg-gold" />
      <span className="pointer-events-none absolute right-14 top-24 h-1 w-1 rounded-full bg-gold/80" />
      <span className="pointer-events-none absolute bottom-28 left-16 h-1 w-1 rounded-full bg-gold/70" />
      <span className="pointer-events-none absolute bottom-14 right-20 h-1.5 w-1.5 rounded-full bg-gold/80" />
      <div className="relative">
        <AnnouncementBody {...props} />
      </div>
    </Reveal>
  );
}

/** Classic double-line frame with small diamond accents at each corner —
 * the "engraved invitation card" look. Purely `border-line`/`gold`, so it
 * reads as elegant regardless of the chosen colour theme. */
function FramedFamily(props: AnnouncementProps) {
  return (
    <Reveal preset="fadeUp" className="mx-auto mt-12 max-w-lg">
      <div className="border border-line bg-ivory p-2">
        <div className="relative border border-accent-soft/60 px-6 py-14 text-center sm:px-12">
          <span className="absolute left-3 top-3 h-2 w-2 rotate-45 bg-gold/70" />
          <span className="absolute right-3 top-3 h-2 w-2 rotate-45 bg-gold/70" />
          <span className="absolute bottom-3 left-3 h-2 w-2 rotate-45 bg-gold/70" />
          <span className="absolute bottom-3 right-3 h-2 w-2 rotate-45 bg-gold/70" />
          <AnnouncementBody {...props} />
        </div>
      </div>
    </Reveal>
  );
}

/** The couple's initials as a small monogram ring above the announcement —
 * modern minimalist logotype treatment rather than florid ornament. */
function MonogramFamily(props: AnnouncementProps) {
  const initials = `${props.couple.groomName.trim().charAt(0)}${props.couple.brideName
    .trim()
    .charAt(0)}`.toUpperCase();
  return (
    <Reveal preset="fadeUp" className="mx-auto mt-12 max-w-lg">
      <div className="border border-line bg-ivory px-6 py-14 text-center sm:px-12">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-soft">
          <span className="font-heading text-2xl italic text-accent">{initials || "&"}</span>
        </div>
        <AnnouncementBody {...props} />
      </div>
    </Reveal>
  );
}

/** A rounded, dashed-border "party invitation" card with a pill banner
 * straddling the top edge and a cluster of balloons in each top corner —
 * matching the popular thiệp-mời-bo-tròn printed-card look (scalloped
 * frame, playful banner header) rather than this section's usual formal
 * engraved-invitation styling. */
function ScallopFamily(props: AnnouncementProps) {
  return (
    <Reveal preset="fadeUp" className="relative mx-auto mt-16 max-w-lg">
      <BalloonCluster className="pointer-events-none absolute -left-6 -top-14 h-28 w-28 sm:-left-10" />
      <BalloonCluster className="pointer-events-none absolute -right-6 -top-14 h-28 w-28 [transform:scaleX(-1)] sm:-right-10" />

      <div className="relative rounded-[2.5rem] border-2 border-dashed border-accent-soft/70 bg-ivory px-6 pb-12 pt-14 text-center sm:px-12">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-8 py-2.5 font-heading text-lg italic tracking-wide text-ivory shadow-flat">
          Thiệp Mời
        </span>
        <AnnouncementBody {...props} />
      </div>
    </Reveal>
  );
}

/** A two-panel "open card" look — a dark cover page on the left (like the
 * outside of a folded physical invitation, its own gold floral corners and
 * a large script "Thiệp Mời" title) sitting beside the actual announcement
 * on the right, as if the card had been opened flat. Stacks to cover-then-
 * content on mobile instead of a literal side-by-side spread. */
function OpenedFamily(props: AnnouncementProps) {
  return (
    <Reveal preset="fadeUp" className="mx-auto mt-12 max-w-3xl">
      <div className="grid overflow-hidden rounded-sm border border-line shadow-flat md:grid-cols-2">
        <div className="relative flex flex-col items-center justify-center gap-6 bg-ink px-8 py-16 text-center text-ivory">
          <DaisyCluster className="pointer-events-none h-14 w-44" />
          <div>
            <p className="font-script text-5xl leading-none text-ivory">Thiệp Mời</p>
            <p className="mt-3 text-xs uppercase tracking-[0.4em] text-ivory/60">
              {props.couple.displayName}
            </p>
          </div>
          <DaisyCluster className="pointer-events-none h-14 w-44 [transform:rotate(180deg)]" />
        </div>

        <div className="relative border-t border-line bg-ivory px-6 py-14 text-center sm:px-12 md:border-l md:border-t-0">
          <DaisyCluster className="pointer-events-none absolute -top-2 right-2 h-10 w-32 [transform:scaleX(-1)]" />
          <AnnouncementBody {...props} />
        </div>
      </div>
    </Reveal>
  );
}

// Short "T2..T7/CN" form, not "Thứ 2".."Thứ 7" — at the real page's ~230px
// column width (main is capped 768px, split into two panels here) the
// longer labels wrapped onto two lines and looked broken.
const CALENDAR_WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Lays out one calendar month as a 7-wide grid of Monday-start weeks
 * (leading/trailing `null`s pad the first/last week to a full row) — pure
 * function of the wedding date, so it's stable across server/client
 * renders with no randomness or "now" involved. */
function buildCalendarWeeks(monthDate: Date): (number | null)[][] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // JS getDay() is Sunday-first (0-6); the reference card's week starts
  // Monday, so this remaps to a Monday-first 0-6 offset.
  const firstWeekdayMondayFirst = (new Date(year, month, 1).getDay() + 6) % 7;

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = new Array(firstWeekdayMondayFirst).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

/** The desk-calendar-page panel from the reference card: a small
 * monogram/"Hạnh Phúc" flourish, the wedding month spelled out, and a
 * real Monday-first calendar grid with the wedding day itself circled in
 * rose — not just a date printed in text, the way a couple would actually
 * circle it on a real calendar. */
function CalendarPanel({ couple }: { couple: CoupleInfo }) {
  const weddingDate = new Date(couple.weddingDate);
  const weeks = buildCalendarWeeks(weddingDate);
  const weddingDay = weddingDate.getDate();
  const monthLabel = weddingDate
    .toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    .toUpperCase();
  const initials = `${couple.groomName.trim().charAt(0) || ""}${
    couple.brideName.trim().charAt(0) || ""
  }`.toUpperCase();

  return (
    <div className="flex flex-col items-center px-6 py-10 text-center sm:py-14">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300">
        <span className="font-heading text-xl italic text-rose-600">{initials || "&"}</span>
      </div>
      <p className="mt-3 font-script text-2xl text-rose-600">Hạnh Phúc</p>
      <p className="mt-5 text-sm font-bold uppercase tracking-[0.15em] text-ink">{monthLabel}</p>

      <div className="mt-5 grid w-full grid-cols-7 gap-y-2">
        {CALENDAR_WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[10px] font-semibold uppercase text-ink-soft">
            {label}
          </span>
        ))}
        {weeks.flat().map((day, i) => (
          <span key={i} className="flex items-center justify-center py-0.5">
            {day !== null &&
              (day === weddingDay ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">
                  {day}
                </span>
              ) : (
                <span className="text-[11px] text-ink">{day}</span>
              ))}
          </span>
        ))}
      </div>

      {couple.weddingDateLunar && (
        <p className="mt-5 text-xs italic text-ink-soft">({couple.weddingDateLunar})</p>
      )}
    </div>
  );
}

/** The classic printed "thiệp mời" spread — a card shown *opened*, left to
 * right: a torn-envelope-flap accent bleeding off the edge, the wedding
 * month's own calendar page with the day circled, then the guest-facing
 * invitation panel itself ("Trân trọng kính mời... đến dự tiệc"), ending
 * in NHÀ TRAI / NHÀ GÁI side by side — matching the traditional
 * Vietnamese printed invitation card format (see reference).
 * Self-contained rather than reusing AnnouncementBody: the content order
 * and register differ enough (guest-facing invite vs. family announcement,
 * parents-last vs. parents-first) that sharing it would mean threading a
 * mode flag through, not a genuine formatting variant. */
function TraditionalFamily({ content, couple, event }: AnnouncementProps) {
  // Always couple.weddingDate — the same source of truth as the cover
  // page/Opening gate and CalendarPanel below — never event.date. `event`
  // is the *first* item of a separately-editable ceremony schedule
  // (frame-registry.tsx passes ctx.events[0]), which can be a different
  // date entirely (a second ceremony, a reception, or just edited out of
  // sync) — that mismatch is exactly what showed the calendar circling one
  // day while the invitation text below printed another. `event` is still
  // used for the details couple.weddingDate doesn't carry: time, venue,
  // address.
  const ceremonyDate = new Date(couple.weddingDate);
  const weekday = ceremonyDate.toLocaleDateString("vi-VN", { weekday: "long" });
  const dateStr = ceremonyDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Reveal preset="fadeUp" className="relative mx-auto mt-12 max-w-3xl">
      <div className="relative grid gap-2 overflow-hidden border border-line bg-rose-50/70 p-2 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-3">
        {/* A diagonal ribbon peeking out of the top-left corner — reads as
            "this card has been opened" the way the reference's envelope
            flap does, but clipped to the card's own corner by this
            container's `overflow-hidden` instead of bleeding into the
            surrounding page. The old version tried to bleed 64px past the
            card's own left edge assuming free space there; on the real
            site `main` is capped at 768px with only ~40px of section
            padding around it, nowhere near enough, so the flap ended up
            floating disconnected from the card instead of attached to it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 -top-8 h-16 w-16 rotate-45 bg-rose-300/90 shadow-sm"
        />
        {/* Same ribbon, mirrored into the opposite (bottom-right) corner —
            balances the card instead of the accent living on only one
            side. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -bottom-8 h-16 w-16 rotate-45 bg-rose-300/90 shadow-sm"
        />
        <div className="border-2 border-gold/50 bg-ivory">
          <CalendarPanel couple={couple} />
        </div>

        <div className="border-2 border-gold/50 bg-ivory px-6 py-14 text-center sm:px-10">
          <p className="font-heading text-lg font-bold uppercase tracking-[0.08em] text-ink">
            Trân trọng kính mời
          </p>
          <div className="mx-auto my-4 w-2/3 border-t border-dotted border-line" />
          <p className="text-sm font-semibold uppercase tracking-wide text-ink">
            Đến dự tiệc mừng hôn lễ của hai chúng tôi
          </p>

          {/* This one card is deliberately the one place in the whole site
              that ignores the project's chosen colour theme — rose-red +
              a real cursive script is what makes it instantly read as
              "thiệp cưới truyền thống" rather than just another card in
              whatever accent colour happens to be picked, the same
              reasoning LeafyCorner/DaisyCluster above stay fixed-colour
              regardless of theme. */}
          <p className="mt-6 font-script text-4xl leading-tight text-rose-600 md:text-5xl">
            {couple.groomName}
          </p>
          <span aria-hidden className="my-1 inline-block text-2xl">
            💕
          </span>
          <p className="font-script text-4xl leading-tight text-rose-600 md:text-5xl">
            {couple.brideName}
          </p>

          <p className="mt-8 text-sm text-ink">Được tổ chức vào hồi</p>
          <p className="mt-1 text-base text-ink">
            {formatCeremonyTime(ceremonyDate)}, {weekday}
          </p>
          <p className="mt-4 font-heading text-3xl font-bold tracking-[0.2em] text-rose-600">
            {dateStr}
          </p>
          {couple.weddingDateLunar && (
            <p className="mt-2 text-xs italic text-ink-soft">
              (Từ ngày {couple.weddingDateLunar})
            </p>
          )}
          {event?.venue && (
            <p className="mt-6 font-script text-2xl leading-snug text-rose-600 md:text-3xl">
              Tại {event.venue}
            </p>
          )}
          {event?.address && (
            <p className="mt-1 text-sm font-bold uppercase tracking-wide text-ink">
              {event.address}
            </p>
          )}

          <p className="mt-6 text-sm italic text-ink">Rất hân hạnh được đón tiếp!</p>

          <div className="mx-auto my-8 w-2/3 border-t border-dotted border-line" />

          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink">
                {content.groom.title}
              </p>
              <p className="mt-3 font-serif text-sm text-ink">{content.groom.father}</p>
              <p className="font-serif text-sm text-ink">{content.groom.mother}</p>
            </div>
            <span aria-hidden className="mt-1 text-base">
              💕
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink">
                {content.bride.title}
              </p>
              <p className="mt-3 font-serif text-sm text-ink">{content.bride.father}</p>
              <p className="font-serif text-sm text-ink">{content.bride.mother}</p>
            </div>
          </div>

          {(content.groom.map?.enabled || content.bride.map?.enabled) && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FamilySideMapBlock side={content.groom} />
              <FamilySideMapBlock side={content.bride} />
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function Family({
  content,
  variant = "simple",
  couple,
  event,
}: {
  content: FamilyContent;
  variant?: string;
  couple: CoupleInfo;
  event?: EventItem;
}) {
  return (
    // Same themed "banded section" treatment as Events — ivory-deep/line are
    // CSS vars from the project's own colour theme (see themeCssVars), so
    // this always matches the configured theme instead of a fixed colour.
    <div className="border-y border-line bg-ivory-deep">
      <Section className="text-center">
        <Eyebrow>Gia đình hai bên</Eyebrow>
        <Divider />

        {variant === "invitation" ? (
          <InvitationFamily content={content} couple={couple} event={event} />
        ) : variant === "botanical" ? (
          <BotanicalFamily content={content} couple={couple} event={event} />
        ) : variant === "watercolor" ? (
          <WatercolorFamily content={content} couple={couple} event={event} />
        ) : variant === "framed" ? (
          <FramedFamily content={content} couple={couple} event={event} />
        ) : variant === "monogram" ? (
          <MonogramFamily content={content} couple={couple} event={event} />
        ) : variant === "scallop" ? (
          <ScallopFamily content={content} couple={couple} event={event} />
        ) : variant === "opened" ? (
          <OpenedFamily content={content} couple={couple} event={event} />
        ) : variant === "traditional" ? (
          <TraditionalFamily content={content} couple={couple} event={event} />
        ) : (
          // "simple" (the old flat 2-card layout) was removed for looking
          // plain/unfinished next to the other variants — old projects
          // still saved with that variant fall through to this same
          // default as any other unrecognised value, same as before.
          <InvitationFamily content={content} couple={couple} event={event} />
        )}
      </Section>
    </div>
  );
}

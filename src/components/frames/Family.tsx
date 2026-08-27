import type { CoupleInfo, EventItem, FamilyContent, FamilySide } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { FloralOrnament, LeafyCorner, BalloonCluster, DaisyCluster } from "@/motion/registry/family";
import { MapModalButton } from "@/components/MapModalButton";

function FamilyCard({ side, align }: { side: FamilySide; align: "left" | "right" }) {
  const map = side.map;
  return (
    <Reveal
      preset={align === "left" ? "fadeRight" : "fadeLeft"}
      className="card-flat px-8 py-10 text-center"
    >
      <p className="font-script text-3xl text-accent">{side.title}</p>
      <div className="mx-auto my-4 h-px w-10 bg-line" />
      <p className="font-serif text-lg text-ink">{side.father}</p>
      <p className="font-serif text-lg text-ink">{side.mother}</p>

      {map?.enabled && (
        <div className="mt-6">
          {map.address && (
            <p className="mb-3 font-serif text-sm text-ink-soft">{map.address}</p>
          )}
          <MapModalButton
            title={side.title}
            lat={map.lat}
            lng={map.lng}
            directionsUrl={map.directionsUrl}
            className="inline-flex w-full items-center justify-center gap-2 border border-ink px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-ink transition-colors hover:bg-ink hover:text-ivory"
          />
        </div>
      )}
    </Reveal>
  );
}

function SimpleFamily({ content }: { content: FamilyContent }) {
  return (
    <div className="mt-12 grid gap-8 md:grid-cols-2">
      <FamilyCard side={content.groom} align="left" />
      <FamilyCard side={content.bride} align="right" />
    </div>
  );
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
  const ceremonyDate = event ? new Date(event.date) : null;
  const weekday = ceremonyDate
    ? ceremonyDate.toLocaleDateString("vi-VN", { weekday: "long" })
    : null;
  const dateStr = ceremonyDate
    ? ceremonyDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

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

      {ceremonyDate && (
        <>
          <div className="mx-auto my-8 h-px w-16 bg-line" />
          <p className="font-serif text-sm text-ink-soft">Được cử hành vào lúc</p>
          <p className="mt-1 font-heading text-xl text-ink">
            {event?.time ? `${event.time} — ` : ""}
            {weekday}, {dateStr}
          </p>
          {couple.weddingDateLunar && (
            <p className="mt-1 text-xs text-ink-soft">({couple.weddingDateLunar})</p>
          )}
          {event?.venue && (
            <p className="mt-6 font-serif text-lg text-ink">Tại {event.venue}</p>
          )}
          {event?.address && <p className="text-sm text-ink-soft">{event.address}</p>}
        </>
      )}
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
        ) : (
          <SimpleFamily content={content} />
        )}
      </Section>
    </div>
  );
}

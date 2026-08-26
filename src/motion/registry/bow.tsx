export type BowVariant = "none" | "simple" | "ribbon" | "double";

export const bowRegistry: Record<BowVariant, { label: string }> = {
  none: { label: "Không có" },
  simple: { label: "Nơ đơn giản" },
  ribbon: { label: "Nơ dải ruy băng" },
  double: { label: "Nơ đôi tầng" },
};

/** A small decorative bow, flat line-art (no fill/shadow, matches the rest
 * of the site) — used as a centred flourish to soften an otherwise plain
 * stretch of a section (under the couple's names, above a story's title). */
export function BowOrnament({
  variant,
  className = "",
}: {
  variant: string;
  className?: string;
}) {
  if (!variant || variant === "none") return null;

  return (
    <div className={`flex justify-center text-gold ${className}`} aria-hidden>
      {variant === "ribbon" ? <RibbonBow /> : variant === "double" ? <DoubleBow /> : <SimpleBow />}
    </div>
  );
}

function SimpleBow() {
  return (
    <svg width="56" height="28" viewBox="0 0 120 60" fill="none">
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M10 12 L54 30 L10 48 Z" />
        <path d="M110 12 L66 30 L110 48 Z" />
      </g>
      <circle cx="60" cy="30" r="6" fill="currentColor" />
    </svg>
  );
}

function RibbonBow() {
  return (
    <svg width="64" height="46" viewBox="0 0 120 100" fill="none">
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M10 15 L52 35 L10 55 Z" />
        <path d="M110 15 L68 35 L110 55 Z" />
        <path d="M52 35 L44 78 L60 64 L76 78 L68 35" />
      </g>
      <circle cx="60" cy="35" r="7" fill="currentColor" />
    </svg>
  );
}

function DoubleBow() {
  return (
    <svg width="72" height="34" viewBox="0 0 140 60" fill="none">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.55">
        <path d="M4 8 L44 30 L4 52 Z" />
        <path d="M136 8 L96 30 L136 52 Z" />
      </g>
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M18 15 L60 30 L18 45 Z" />
        <path d="M122 15 L80 30 L122 45 Z" />
      </g>
      <circle cx="70" cy="30" r="7" fill="currentColor" />
    </svg>
  );
}

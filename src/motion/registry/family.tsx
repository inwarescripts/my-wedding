export type FamilyVariant =
  | "simple"
  | "invitation"
  | "botanical"
  | "watercolor"
  | "framed"
  | "monogram"
  | "scallop"
  | "opened";

export const familyRegistry: Record<FamilyVariant, { label: string }> = {
  simple: { label: "Đơn giản (2 thẻ)" },
  invitation: { label: "Thiệp trang trọng" },
  botanical: { label: "Lá xanh nhiệt đới" },
  watercolor: { label: "Màu nước & nhũ vàng" },
  framed: { label: "Khung viền cổ điển" },
  monogram: { label: "Huy hiệu đầu tên" },
  scallop: { label: "Thiệp bo tròn & bóng bay" },
  opened: { label: "Thiệp mở hai trang" },
};

/** A stylised branch-and-leaves flourish for corners of the "invitation"
 * family variant — flat line-art (`currentColor` stroke only), same visual
 * language as BowOrnament. Mirror with `scale-x-[-1]` for the opposite
 * corner rather than drawing it twice. */
export function FloralOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <path
        d="M6 6 C 26 12 36 24 42 38 C 48 52 56 58 72 64"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse cx="15" cy="9" rx="7.5" ry="3.4" transform="rotate(-28 15 9)" />
        <ellipse cx="26" cy="15" rx="8" ry="3.6" transform="rotate(-6 26 15)" />
        <ellipse cx="35" cy="25" rx="7.5" ry="3.4" transform="rotate(22 35 25)" />
        <ellipse cx="43" cy="38" rx="7" ry="3.2" transform="rotate(48 43 38)" />
        <ellipse cx="53" cy="47" rx="6.5" ry="3" transform="rotate(65 53 47)" />
        <ellipse cx="64" cy="57" rx="6" ry="2.8" transform="rotate(80 64 57)" />
      </g>
      <circle cx="7" cy="6" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Eucalyptus-style leaf cluster for the "botanical" family variant.
 * Deliberately fixed sage-green tones (not theme-driven like the rest of
 * the site's colour system) — greenery is the whole identity of this
 * particular template style, the same way a real "leafy" printed
 * invitation stays green regardless of the couple's chosen palette
 * elsewhere. Mirror with `scale-x-[-1]` for the opposite corner. */
export function LeafyCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden>
      <g fill="#6f8760" opacity="0.9">
        <ellipse cx="18" cy="14" rx="17" ry="6.2" transform="rotate(-38 18 14)" />
        <ellipse cx="36" cy="30" rx="19" ry="6.8" transform="rotate(-14 36 30)" />
        <ellipse cx="10" cy="38" rx="15" ry="5.6" transform="rotate(24 10 38)" />
        <ellipse cx="52" cy="20" rx="15" ry="5.4" transform="rotate(8 52 20)" />
        <ellipse cx="58" cy="46" rx="17" ry="6" transform="rotate(-28 58 46)" />
        <ellipse cx="30" cy="52" rx="14" ry="5.2" transform="rotate(50 30 52)" />
      </g>
      <g fill="#9db589" opacity="0.95">
        <ellipse cx="24" cy="8" rx="10.5" ry="4.2" transform="rotate(-48 24 8)" />
        <ellipse cx="44" cy="36" rx="11.5" ry="4.4" transform="rotate(-6 44 36)" />
        <ellipse cx="16" cy="26" rx="10" ry="4" transform="rotate(30 16 26)" />
      </g>
      <g stroke="#5c7050" strokeWidth="0.9" fill="none" opacity="0.7">
        <path d="M4 4 Q 20 16 22 32" />
        <path d="M4 4 Q 30 12 46 22" />
      </g>
    </svg>
  );
}

/** A single flat daisy — a ring of white petals around a gold centre.
 * Building block for DaisyCluster below. */
function Daisy({ cx, cy, r, rotate = 0 }: { cx: number; cy: number; r: number; rotate?: number }) {
  const petalCount = 8;
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      {Array.from({ length: petalCount }, (_, i) => {
        const angle = (360 / petalCount) * i;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy - r * 0.62}
            rx={r * 0.34}
            ry={r * 0.62}
            fill="#fff"
            stroke="#e7ded0"
            strokeWidth="0.6"
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.4} fill="#e0a940" />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="#d99a2b" opacity="0.5" />
    </g>
  );
}

/** A loose scatter of white daisies + soft green leaves — the classic
 * "hoa cúc" printed-invitation wreath (see the reference photo: daisies
 * clustered above and below a ribbon-style banner). Fixed true-to-life
 * colours rather than theme-driven, same reasoning as LeafyCorner: real
 * flowers don't recolour to match a picked accent, and that's exactly what
 * reads as "an actual flower illustration" rather than a flat graphic.
 * Pure SVG (no external photo/PNG asset) so it stays crisp at any size,
 * has zero licensing question, and never has a broken-image moment. */
export function DaisyCluster({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 70" className={className} aria-hidden>
      <g stroke="#7a9169" strokeWidth="1.4" fill="none" opacity="0.85">
        <path d="M40 60 Q 55 40 70 44" />
        <path d="M120 58 Q 108 38 96 42" />
        <path d="M150 55 Q 165 36 178 40" />
      </g>
      <g fill="#7a9169" opacity="0.9">
        <ellipse cx="58" cy="46" rx="10" ry="4" transform="rotate(-30 58 46)" />
        <ellipse cx="30" cy="52" rx="9" ry="3.6" transform="rotate(20 30 52)" />
        <ellipse cx="104" cy="44" rx="9" ry="3.6" transform="rotate(35 104 44)" />
        <ellipse cx="164" cy="42" rx="10" ry="4" transform="rotate(-20 164 42)" />
        <ellipse cx="185" cy="48" rx="8" ry="3.2" transform="rotate(25 185 48)" />
      </g>
      <Daisy cx={30} cy={30} r={16} rotate={-8} />
      <Daisy cx={64} cy={20} r={12} rotate={12} />
      <Daisy cx={92} cy={34} r={10} rotate={-15} />
      <Daisy cx={126} cy={18} r={14} rotate={6} />
      <Daisy cx={158} cy={30} r={11} rotate={-10} />
      <Daisy cx={182} cy={20} r={9} rotate={18} />
    </svg>
  );
}

/** A small cluster of party balloons for the "scallop" family variant —
 * flat shapes rather than a photo/emoji so, like FloralOrnament/LeafyCorner
 * above, it can be recoloured per-balloon via the theme's own CSS vars
 * (accent / gold / accent-soft) instead of being locked to one fixed
 * palette. Mirror with `scale-x-[-1]` for the opposite corner. */
export function BalloonCluster({ className = "" }: { className?: string }) {
  const balloons = [
    { cx: 24, cy: 34, rx: 15, ry: 18, tone: "text-accent", stringTo: [24, 90] },
    { cx: 52, cy: 20, rx: 12, ry: 14.5, tone: "text-gold", stringTo: [52, 70] },
    { cx: 72, cy: 40, rx: 10, ry: 12, tone: "text-accent-soft", stringTo: [72, 82] },
  ];
  return (
    <svg viewBox="0 0 96 100" className={className} aria-hidden>
      <g stroke="currentColor" className="text-line" strokeWidth="1" opacity="0.7">
        {balloons.map((b, i) => (
          <path
            key={i}
            d={`M${b.cx} ${b.cy + b.ry} Q ${b.cx + (i % 2 === 0 ? 4 : -4)} ${
              (b.cy + b.ry + b.stringTo[1]) / 2
            } ${b.stringTo[0]} ${b.stringTo[1]}`}
            fill="none"
          />
        ))}
      </g>
      {balloons.map((b, i) => (
        <g key={i}>
          <ellipse
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            className={b.tone}
            fill="currentColor"
            opacity="0.88"
          />
          <ellipse
            cx={b.cx - b.rx * 0.32}
            cy={b.cy - b.ry * 0.38}
            rx={b.rx * 0.28}
            ry={b.ry * 0.22}
            fill="#fff"
            opacity="0.35"
          />
          <path
            d={`M${b.cx - 2} ${b.cy + b.ry} L${b.cx} ${b.cy + b.ry + 4} L${b.cx + 2} ${b.cy + b.ry}`}
            className={b.tone}
            fill="currentColor"
            opacity="0.88"
          />
        </g>
      ))}
    </svg>
  );
}

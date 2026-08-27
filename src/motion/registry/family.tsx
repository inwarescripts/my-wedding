export type FamilyVariant =
  | "simple"
  | "invitation"
  | "botanical"
  | "watercolor"
  | "framed"
  | "monogram"
  | "arch"
  | "minimal";

export const familyRegistry: Record<FamilyVariant, { label: string }> = {
  simple: { label: "Đơn giản (2 thẻ)" },
  invitation: { label: "Thiệp trang trọng" },
  botanical: { label: "Lá xanh nhiệt đới" },
  watercolor: { label: "Màu nước & nhũ vàng" },
  framed: { label: "Khung viền cổ điển" },
  monogram: { label: "Huy hiệu đầu tên" },
  arch: { label: "Vòm cổng cưới" },
  minimal: { label: "Tối giản" },
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

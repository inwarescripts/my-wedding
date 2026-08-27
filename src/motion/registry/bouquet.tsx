/** A small flat-illustration bouquet — fanned blossoms in the project's own
 * accent colour (so it always matches the chosen theme, unlike a stock
 * photo), fixed muted-green stems/leaves (greenery reads as green
 * regardless of theme, same reasoning as LeafyCorner in family.tsx), and a
 * gold ribbon tying the stems. Pure SVG, no external asset — nothing to
 * fail to load and no licensing to worry about. */
export function BouquetOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden>
      {/* Stems */}
      <g stroke="#5c7050" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M60 150 L60 96" />
        <path d="M60 150 L40 92" />
        <path d="M60 150 L80 92" />
        <path d="M60 150 L26 100" />
        <path d="M60 150 L94 100" />
      </g>

      {/* Leaves */}
      <g fill="#6f8760">
        <ellipse cx="44" cy="118" rx="10" ry="4" transform="rotate(-40 44 118)" />
        <ellipse cx="78" cy="120" rx="10" ry="4" transform="rotate(40 78 120)" />
      </g>

      {/* Ribbon */}
      <g fill="none" stroke="currentColor" className="text-gold" strokeWidth="2.5">
        <path d="M46 132 Q60 122 74 132" />
        <path d="M48 140 L40 150 M72 140 L80 150" strokeLinecap="round" />
      </g>

      {/* Blossoms — five simple flowers fanned across the top, each a ring
          of petals around a centre dot. Colour comes from `currentColor`
          (set via className, e.g. text-accent) so it follows the theme. */}
      {[
        { cx: 60, cy: 86, r: 15, opacity: 1 },
        { cx: 38, cy: 78, r: 12, opacity: 0.9 },
        { cx: 82, cy: 78, r: 12, opacity: 0.9 },
        { cx: 22, cy: 92, r: 10, opacity: 0.8 },
        { cx: 98, cy: 92, r: 10, opacity: 0.8 },
      ].map((f, i) => (
        <g key={i} opacity={f.opacity} className="text-accent" fill="currentColor">
          {Array.from({ length: 6 }, (_, p) => {
            const angle = (Math.PI / 3) * p;
            const px = f.cx + Math.cos(angle) * f.r * 0.62;
            const py = f.cy + Math.sin(angle) * f.r * 0.62;
            return (
              <ellipse
                key={p}
                cx={px}
                cy={py}
                rx={f.r * 0.42}
                ry={f.r * 0.62}
                transform={`rotate(${(angle * 180) / Math.PI} ${px} ${py})`}
                opacity={0.85}
              />
            );
          })}
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.32} className="text-gold" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

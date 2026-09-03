import type { CSSProperties } from "react";

export interface ColorThemePalette {
  ivory: string;
  ivoryDeep: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accentSoft: string;
  line: string;
  gold: string;
}

export type ColorTheme =
  | "classic"
  | "blushRose"
  | "pink"
  | "rose"
  | "sageGarden"
  | "lavenderDusk"
  | "terracottaSun"
  | "burgundy"
  | "navy"
  | "midnightGold"
  | "crimsonFestive"
  | "forestNight"
  | "deepNavy"
  | "royalPurple";

export const colorThemeRegistry: Record<ColorTheme, { label: string; colors: ColorThemePalette }> = {
  classic: {
    label: "Ivory cổ điển",
    colors: {
      ivory: "#f6f1ea",
      ivoryDeep: "#efe7db",
      ink: "#2b2621",
      inkSoft: "#55493f",
      accent: "#a9765a",
      accentSoft: "#d8b9a2",
      line: "#e2d6c6",
      gold: "#b08d57",
    },
  },
  blushRose: {
    label: "Hồng phấn",
    colors: {
      ivory: "#fbf1ee",
      ivoryDeep: "#f5e4de",
      ink: "#3a2620",
      inkSoft: "#6e4d44",
      accent: "#c4776e",
      accentSoft: "#e8bcb3",
      line: "#eeccc3",
      gold: "#c99a6a",
    },
  },
  pink: {
    label: "Hồng ngọt ngào",
    colors: {
      ivory: "#fdf0f5",
      ivoryDeep: "#fbdfea",
      ink: "#451f30",
      inkSoft: "#7a4258",
      accent: "#df5a8c",
      accentSoft: "#f3aaca",
      line: "#f6cbe0",
      gold: "#c9a15a",
    },
  },
  rose: {
    label: "Hoa hồng đỏ",
    colors: {
      ivory: "#faf1ee",
      ivoryDeep: "#f2ddd6",
      ink: "#3d1b1f",
      inkSoft: "#6b3138",
      accent: "#a83250",
      accentSoft: "#d98a9c",
      line: "#e8c3c8",
      gold: "#b98a4a",
    },
  },
  sageGarden: {
    label: "Xanh sage",
    colors: {
      ivory: "#f3f4ec",
      ivoryDeep: "#e7e9d9",
      ink: "#2b2f22",
      inkSoft: "#525a40",
      accent: "#7c8a5e",
      accentSoft: "#c1caa8",
      line: "#dbe0c8",
      gold: "#a68a4e",
    },
  },
  lavenderDusk: {
    label: "Tím lavender",
    colors: {
      ivory: "#f5f1f5",
      ivoryDeep: "#e9e0e8",
      ink: "#2e2733",
      inkSoft: "#5a4e63",
      accent: "#8e6f96",
      accentSoft: "#cdb9d1",
      line: "#ded0dd",
      gold: "#a98a5c",
    },
  },
  terracottaSun: {
    label: "Cam đất nung",
    colors: {
      ivory: "#faf2e9",
      ivoryDeep: "#f1e0cd",
      ink: "#3a2618",
      inkSoft: "#6b4a34",
      accent: "#c1682f",
      accentSoft: "#e8b98a",
      line: "#ecd2b3",
      gold: "#c08a3e",
    },
  },
  burgundy: {
    label: "Đỏ rượu vang",
    colors: {
      ivory: "#f7efec",
      ivoryDeep: "#ecd9d3",
      ink: "#2c1416",
      inkSoft: "#5c2a2d",
      accent: "#6d1f2c",
      accentSoft: "#b97e84",
      line: "#ddc0bf",
      gold: "#b08d57",
    },
  },
  navy: {
    label: "Xanh navy",
    colors: {
      ivory: "#eef1f5",
      ivoryDeep: "#dfe4ec",
      ink: "#131b2e",
      inkSoft: "#3a4562",
      accent: "#1f3a63",
      accentSoft: "#7c93b8",
      line: "#cdd6e4",
      gold: "#c9a24b",
    },
  },
  midnightGold: {
    label: "Đêm vàng sang trọng",
    colors: {
      ivory: "#1c1a22",
      ivoryDeep: "#252230",
      ink: "#f3ead9",
      inkSoft: "#c9bda5",
      accent: "#c9a24b",
      accentSoft: "#8a7028",
      line: "#3a3644",
      gold: "#d8b464",
    },
  },
  // Same "flip" as midnightGold — `ivory` (the page background) becomes
  // the dominant colour instead of staying a neutral backdrop, so this one
  // reads as a fully red-and-gold festive theme (think the classic red
  // Chinese/Vietnamese wedding invitation) rather than "ivory site with a
  // red accent". `ink`/`inkSoft` swap to warm gold/cream so body text
  // stays legible on the red background.
  crimsonFestive: {
    label: "Đỏ chói hỷ sự",
    colors: {
      ivory: "#7a0f16",
      ivoryDeep: "#5c0c11",
      ink: "#f5e3b8",
      inkSoft: "#d9bd8a",
      accent: "#d4af37",
      accentSoft: "#9c7a2e",
      line: "#8a2028",
      gold: "#e0b74a",
    },
  },
  // Same "flip" as midnightGold/crimsonFestive — a deep forest green
  // becomes `ivory` (the page background) itself, with warm cream/gold
  // text and accents for contrast, rather than staying a light neutral
  // backdrop with a green accent.
  forestNight: {
    label: "Xanh rừng đêm",
    colors: {
      ivory: "#162614",
      ivoryDeep: "#1f351d",
      ink: "#f2ecd9",
      inkSoft: "#c3bd9e",
      accent: "#c9b06a",
      accentSoft: "#7c6d34",
      line: "#2c4530",
      gold: "#d3bb74",
    },
  },
  deepNavy: {
    label: "Xanh navy đậm",
    colors: {
      ivory: "#0a202f",
      ivoryDeep: "#0e2a3d",
      ink: "#f0ece0",
      inkSoft: "#9fb3c4",
      accent: "#c9a24b",
      accentSoft: "#6f83a0",
      line: "#1c3446",
      gold: "#d4b56a",
    },
  },
  // Same "flip" as midnightGold/crimsonFestive/forestNight/deepNavy — the
  // pure, fully-saturated purple (#6e0a9d exactly, not softened toward a
  // light pastel) IS the page background itself, not just an accent on a
  // light backdrop. Gold text/accents for contrast, matching the other
  // dark "luxury" themes' palette.
  royalPurple: {
    label: "Tím hoàng gia",
    colors: {
      ivory: "#6e0a9d",
      ivoryDeep: "#560a7d",
      ink: "#f5ecd9",
      inkSoft: "#d9c4e6",
      accent: "#d4af6a",
      accentSoft: "#9c7a2e",
      line: "#8a2fb8",
      gold: "#d4af6a",
    },
  },
};

// The admin's own free-pick colors (see ThemeSwatchPicker in
// ProjectEditor.tsx) don't add a registry entry — there's no fixed label
// for "whatever background/text colors the couple happened to pick".
// Instead both chosen hexes ride inside `settings.colorTheme` itself as
// "custom:#bgHex|#textHex", so every existing call site
// (getColorThemePalette/themeCssVars, both already taking a plain string)
// keeps working unchanged; only these two need to recognize the prefix and
// derive a palette on the fly instead of doing a registry lookup.
const CUSTOM_THEME_PREFIX = "custom:";

export function customThemeValue(bgHex: string, textHex: string): string {
  return `${CUSTOM_THEME_PREFIX}${bgHex}|${textHex}`;
}

export function parseCustomTheme(theme: string): { bg: string; text: string } | null {
  if (!theme.startsWith(CUSTOM_THEME_PREFIX)) return null;
  const raw = theme.slice(CUSTOM_THEME_PREFIX.length);
  const [bg, text] = raw.split("|");
  if (!bg) return null;
  // Older saves (before the text-color picker existed) only ever stored
  // one hex — fall back to a computed black/white text color for those
  // instead of breaking on the missing second half.
  return { bg, text: text || pickContrastingText(bg) };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Linearly blends two hex colors — `t=0` is pure `hexA`, `t=1` is pure
 * `hexB`. Used (not HSL lightness math) to derive the rest of a custom
 * palette from the two admin-picked colors: blending directly toward each
 * other works the same way whether the picked background is light or
 * dark, where an HSL-lightness approach would have to special-case which
 * end of the scale it's starting from. */
function mixHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** Plain relative-luminance check, used only as the fallback for
 * old single-color saves above (a real second pick always wins). */
function pickContrastingText(bgHex: string): string {
  const [r, g, b] = hexToRgb(bgHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#2b2621" : "#f6f1ea";
}

/** Builds a full 8-colour palette from the admin's two picks — background
 * and text — instead of trying to derive a whole theme from one color.
 * `ivory`/`ink` are the picks themselves, exactly as chosen (never
 * softened toward a "safer" tint); everything else is a blend between the
 * two so the palette still reads as coherent shades of the same two
 * colors rather than unrelated tones bolted on. */
function deriveCustomPalette(bgHex: string, textHex: string): ColorThemePalette {
  return {
    ivory: bgHex,
    ivoryDeep: mixHex(bgHex, textHex, 0.12),
    ink: textHex,
    inkSoft: mixHex(textHex, bgHex, 0.35),
    accent: textHex,
    accentSoft: mixHex(textHex, bgHex, 0.45),
    line: mixHex(bgHex, textHex, 0.25),
    gold: "#b08d57",
  };
}

/** Resolves a theme key to its palette, falling back to "classic" for any
 * unrecognized/legacy value. Use this (not a direct registry lookup) so
 * every caller shares the same fallback behavior. */
export function getColorThemePalette(theme: string): ColorThemePalette {
  const custom = parseCustomTheme(theme);
  if (custom) return deriveCustomPalette(custom.bg, custom.text);
  return colorThemeRegistry[theme as ColorTheme]?.colors ?? colorThemeRegistry.classic.colors;
}

/** Overrides the theme CSS custom properties (declared in globals.css and
 * aliased 1:1 by Tailwind's `@theme inline`) on a wrapping element — every
 * `bg-ivory`/`text-ink`/`border-line`/etc. utility used anywhere in the
 * wedding renderer tree picks it up for free via normal CSS var cascade, no
 * per-component theming needed. */
export function themeCssVars(theme: string): CSSProperties {
  const palette = getColorThemePalette(theme);
  return {
    "--color-ivory": palette.ivory,
    "--color-ivory-deep": palette.ivoryDeep,
    "--color-ink": palette.ink,
    "--color-ink-soft": palette.inkSoft,
    "--color-accent": palette.accent,
    "--color-accent-soft": palette.accentSoft,
    "--color-line": palette.line,
    "--color-gold": palette.gold,
  } as CSSProperties;
}

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
  | "midnightGold";

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
};

/** Resolves a theme key to its palette, falling back to "classic" for any
 * unrecognized/legacy value. Use this (not a direct registry lookup) so
 * every caller shares the same fallback behavior. */
export function getColorThemePalette(theme: string): ColorThemePalette {
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

import type { CSSProperties } from "react";
import type { BackgroundSettings } from "@/types/wedding-config";
import type { ColorThemePalette } from "./theme";

export type BackgroundPattern = "dots" | "sprig" | "diagonal" | "arch";

export const backgroundPatternRegistry: Record<BackgroundPattern, { label: string }> = {
  dots: { label: "Chấm bi mảnh" },
  sprig: { label: "Nhành lá" },
  diagonal: { label: "Sọc chéo mảnh" },
  arch: { label: "Vòm ren" },
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function encodeSvg(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function backgroundStyle(
  palette: ColorThemePalette,
  settings: BackgroundSettings
): CSSProperties {
  const { mode, pattern } = settings;
  if (mode !== "pattern") return { backgroundColor: palette.ivory };

  // The line/dot colour is always derived from the theme's own `line` tone
  // (never a free-picked colour) so texture always reads as a shade of the
  // active palette instead of clashing with it.
  const line = palette.line;

  switch (pattern as BackgroundPattern) {
    case "sprig": {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><g stroke='${line}' stroke-width='1' fill='none' stroke-opacity='0.6' stroke-linecap='round'><path d='M36 58 C36 46 36 34 36 20'/><path d='M36 46 C30 42 26 38 24 32'/><path d='M36 46 C42 42 46 38 48 32'/><path d='M36 34 C31 31 28 28 26 23'/><path d='M36 34 C41 31 44 28 46 23'/></g></svg>`;
      return {
        backgroundColor: palette.ivory,
        backgroundImage: `url("${encodeSvg(svg)}")`,
        backgroundSize: "72px 72px",
      };
    }
    case "diagonal":
      return {
        backgroundColor: palette.ivory,
        backgroundImage: `repeating-linear-gradient(45deg, ${hexToRgba(line, 0.55)} 0, ${hexToRgba(line, 0.55)} 1px, transparent 1px, transparent 22px)`,
      };
    case "arch": {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20'><path d='M0 20 A10 10 0 0 1 20 20 A10 10 0 0 1 40 20' fill='none' stroke='${line}' stroke-width='1' stroke-opacity='0.55'/></svg>`;
      return {
        backgroundColor: palette.ivory,
        backgroundImage: `url("${encodeSvg(svg)}")`,
        backgroundSize: "40px 20px",
      };
    }
    case "dots":
    default: {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><circle cx='14' cy='14' r='1.5' fill='${line}' fill-opacity='0.6'/></svg>`;
      return {
        backgroundColor: palette.ivory,
        backgroundImage: `url("${encodeSvg(svg)}")`,
        backgroundSize: "28px 28px",
      };
    }
  }
}

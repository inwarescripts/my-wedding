import type { CSSProperties } from "react";
import type { BackgroundSettings } from "@/types/wedding-config";
import type { ColorThemePalette } from "./theme";

export type BackgroundPattern = "dots" | "sprig" | "diagonal" | "arch" | "floral";

export const backgroundPatternRegistry: Record<BackgroundPattern, { label: string }> = {
  dots: { label: "Chấm bi mảnh" },
  sprig: { label: "Nhành lá" },
  diagonal: { label: "Sọc chéo mảnh" },
  arch: { label: "Vòm ren" },
  floral: { label: "Nhành lá hoa (ảnh tĩnh)" },
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
    // A real illustrated corner flourish (not a procedurally-tinted SVG
    // pattern like the other four) — so unlike them it doesn't recolour
    // per colour theme, the same tradeoff as the couple's own coverImage
    // or the opening gate's real artwork elsewhere in this app.
    //
    // `repeat-y`, not a single anchored copy: every template's first frame
    // is Hero, a `h-[100svh] w-full` edge-to-edge cover photo (see
    // Hero.tsx) — taller than this art itself, so a single copy anchored
    // at `main`'s very top would sit 100% behind it and never be seen at
    // all. `main`'s own background is only ever visible in the transparent
    // gutters between frames (each <Section> pads itself but paints no
    // background of its own, see Section.tsx) and in any frame that
    // doesn't itself go edge-to-edge — repeating the tile down the whole
    // column means it reliably shows up in at least one of those gaps as
    // the guest scrolls, instead of gambling on a single fixed spot.
    // Deliberately NOT `background-attachment: fixed` — that positions
    // relative to the *viewport*, not this element, which would shove the
    // art into the browser window's actual top-left corner instead of
    // `main`'s own (this column is centred with empty margins on wide
    // desktop screens, so those aren't the same point).
    case "floral":
      return {
        backgroundColor: palette.ivory,
        backgroundImage: "url(/flower/bg-main.webp)",
        backgroundRepeat: "repeat-y",
        backgroundPosition: "top left",
        backgroundSize: "min(340px, 65vw) auto",
      };
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

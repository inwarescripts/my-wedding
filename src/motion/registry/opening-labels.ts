// Plain data, no "use client" — shared between the opening gate itself
// (src/motion/home/opening.tsx, which re-exports these two) and server
// code that just needs the label for display (e.g. the "/" template
// gallery cards), which can't safely import a "use client" module.

export type OpeningVariant =
  | "particleBloom"
  | "silkWave"
  | "goldenRings"
  | "heartRibbon"
  | "roseRibbon"
  | "doubleHappiness"
  | "redDoor"
  | "curtain"
  | "envelope";

export const openingRegistry: Record<OpeningVariant, { label: string }> = {
  particleBloom: { label: "Dải hạt sáng 3D" },
  silkWave: { label: "Lụa 3D uốn lượn" },
  goldenRings: { label: "Nhẫn cưới 3D xoay" },
  heartRibbon: { label: "Dải trái tim 3D" },
  roseRibbon: { label: "Dải hoa hồng 3D" },
  doubleHappiness: { label: "Ấn Hỉ vàng son 3D" },
  redDoor: { label: "Cửa cưới đóng mở" },
  curtain: { label: "Rèm nhung khép mở" },
  envelope: { label: "Mở thiệp thư" },
};

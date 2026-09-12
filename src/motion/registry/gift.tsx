export type GiftVariant = "default" | "envelope" | "envelopeRed";

export const giftRegistry: Record<GiftVariant, { label: string }> = {
  default: { label: "Danh sách tài khoản" },
  // "envelope" (not "envelopeYellow") for backward compatibility — existing
  // projects already saved with this value before the red option existed.
  envelope: { label: "Phong bao vàng (nhấn để mở)" },
  envelopeRed: { label: "Phong bao đỏ (nhấn để mở)" },
};

export const ENVELOPE_IMAGE: Record<"envelope" | "envelopeRed", string> = {
  envelope: "/thiep.webp",
  envelopeRed: "/thiep2.webp",
};

export type GiftVariant = "default" | "envelope";

export const giftRegistry: Record<GiftVariant, { label: string }> = {
  default: { label: "Danh sách tài khoản" },
  envelope: { label: "Phong bao thiệp (nhấn để mở)" },
};

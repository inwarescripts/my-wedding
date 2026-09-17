export type RsvpVariant = "form" | "modal" | "elegant" | "floral";

export const rsvpRegistry: Record<RsvpVariant, { label: string }> = {
  form: { label: "Hiện form ngay" },
  modal: { label: "Nút bấm, mở form trong popup" },
  elegant: { label: "Tối giản thanh lịch (không bó hoa)" },
  floral: { label: "Khung hoa ảnh thật" },
};

export type RsvpVariant = "form" | "modal";

export const rsvpRegistry: Record<RsvpVariant, { label: string }> = {
  form: { label: "Hiện form ngay" },
  modal: { label: "Nút bấm, mở form trong popup" },
};

export type ScheduleVariant = "timeline" | "card";

export const scheduleRegistry: Record<ScheduleVariant, { label: string }> = {
  timeline: { label: "Đường thời gian" },
  card: { label: "Thẻ màu theo theme" },
};

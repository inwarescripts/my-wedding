export type EventsVariant = "floral" | "classic";

export const eventsRegistry: Record<EventsVariant, { label: string }> = {
  floral: { label: "Có hoa trang trí" },
  classic: { label: "Không trang trí" },
};

export type StoryVariant = "floral" | "classic";

export const storyRegistry: Record<StoryVariant, { label: string }> = {
  floral: { label: "Có bó hoa trang trí" },
  classic: { label: "Không trang trí" },
};

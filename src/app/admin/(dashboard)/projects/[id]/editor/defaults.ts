import type { FrameType } from "@/types/wedding-config";

// Starter content for a section added fresh in the editor. Shapes must match
// the Content types in src/types/wedding-config.ts for each frame type.
export function defaultFrameContent(type: FrameType): unknown {
  switch (type) {
    case "story":
      return {
        eyebrow: "Câu chuyện của chúng tôi",
        title: "Tiêu đề mới",
        paragraphs: ["Viết nội dung câu chuyện ở đây..."],
        image: "",
      };
    case "photoStack":
      return { title: "Những khoảnh khắc", images: [] };
    case "gallery":
      return { title: "Album ảnh", subtitle: "", items: [] };
    case "timeline":
      return { items: [] };
    case "schedule":
      return { items: [] };
    case "family": {
      const map = { enabled: false, address: "", lat: 0, lng: 0, directionsUrl: "" };
      return {
        groom: { title: "Nhà trai", father: "", mother: "", map: { ...map } },
        bride: { title: "Nhà gái", father: "", mother: "", map: { ...map } },
      };
    }
    case "map":
      return { venue: "", address: "", lat: 0, lng: 0, directionsUrl: "" };
    case "rsvp":
      return { showGuestCount: true, showMessage: true };
    default:
      return {};
  }
}

export const DEFAULT_VARIANT: Partial<Record<FrameType, string>> = {
  gallery: "masonry",
  photoStack: "floatingPhotos",
  timeline: "alternating",
  family: "simple",
};

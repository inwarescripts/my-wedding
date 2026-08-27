import type { ScheduleIconKey } from "@/types/wedding-config";

export const scheduleIconRegistry: Record<ScheduleIconKey, { label: string }> = {
  car: { label: "Xe hoa" },
  home: { label: "Nhà" },
  rings: { label: "Nhẫn cưới" },
  camera: { label: "Máy ảnh" },
  heart: { label: "Trái tim" },
  gift: { label: "Quà" },
  clock: { label: "Đồng hồ" },
  mapPin: { label: "Địa điểm" },
};

/** Flat line-art icons (no fill, `currentColor` stroke) — same visual
 * language as BowOrnament, used inside each schedule item's circle badge. */
export function ScheduleIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name as ScheduleIconKey) {
    case "car":
      return (
        <svg {...props}>
          <path d="M4 16V11.5L6 7h12l2 4.5V16" />
          <path d="M3 16h18v2.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17H6.5v1.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V16Z" />
          <circle cx="7" cy="16" r="1.4" />
          <circle cx="17" cy="16" r="1.4" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M4 11.5 12 4l8 7.5" />
          <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "rings":
      return (
        <svg {...props}>
          <circle cx="9.5" cy="14" r="4.5" />
          <circle cx="14.5" cy="14" r="4.5" />
        </svg>
      );
    case "camera":
      return (
        <svg {...props}>
          <path d="M4 8.5a1 1 0 0 1 1-1h2l1.2-1.8a1 1 0 0 1 .8-.4h6a1 1 0 0 1 .8.4L17 7.5h2a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
          <circle cx="12" cy="13" r="3.4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...props}>
          <path d="M12 20s-7-4.4-9.5-9C1 8 2.2 4.8 5.4 4.1 7.6 3.6 10 4.7 12 7.2c2-2.5 4.4-3.6 6.6-3.1 3.2.7 4.4 3.9 2.9 6.9C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...props}>
          <rect x="4" y="9.5" width="16" height="10" rx="1" />
          <path d="M4 13h16" />
          <path d="M12 9.5V20" />
          <path d="M12 9.5c-1-2.5-3-3.5-4.2-2.7C6.6 7.6 7 9.5 9 9.5" />
          <path d="M12 9.5c1-2.5 3-3.5 4.2-2.7 1.2.8.8 2.7-1.2 2.7" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5l3 2" />
        </svg>
      );
    case "mapPin":
      return (
        <svg {...props}>
          <path d="M12 21s6.5-6.2 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.8 6.5 11 6.5 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );
    default:
      return null;
  }
}

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApprovedGuestbookMessages } from "@/app/actions/public";

interface WishItem {
  id: string;
  name: string;
  message: string;
}

// Always in the rotation, never replaced — real approved wishes (fetched
// once on mount) just get folded in alongside them, so guests always see a
// lively stream even on a brand-new project with zero real wishes yet, and
// the stream never goes "real-only and awkwardly sparse" either once a
// couple only has 1-2 approved messages.
const DUMMY_WISHES: WishItem[] = [
  { id: "dummy-1", name: "Huy", message: "Chúc hai bạn trăm năm hạnh phúc! 🎉" },
  { id: "dummy-2", name: "Chanh", message: "Chúc mừng hạnh phúc trăm năm!" },
  { id: "dummy-3", name: "Chinh", message: "Chúc hai bạn trăm năm hạnh phúc!" },
  { id: "dummy-4", name: "Linh", message: "🌸 Đồng tâm đồng lòng, xây đắp tổ ấm thịnh vượng!" },
  { id: "dummy-5", name: "Hà", message: "Chúc mừng hạnh phúc! ❤️" },
  { id: "dummy-6", name: "Minh", message: "Trăm năm hạnh phúc, bạc đầu răng long!" },
];

const MAX_VISIBLE = 5;
const INTERVAL_MS = 3400;

// "default" is the original behavior: `absolute` inside Hero's own
// `position: relative` box, so it scrolls away together with the Hero
// photo once the guest scrolls past it. "bottomLeft"/"bottomRight" pin it
// `fixed` to a screen corner instead — visible the whole time, independent
// of scroll position, the actual TikTok-live-comments look (see
// WeddingRenderer.tsx, which nests this INSIDE `main` in the DOM but keeps
// `main` transform-free, so `fixed` still resolves against the true
// viewport — required for it to stay visible through the whole scroll).
const POSITION_CLASS: Record<string, string> = {
  default:
    "absolute bottom-44 left-0 z-10 h-48 w-[62%] max-w-sm md:bottom-56 md:left-6 md:h-64 md:w-96",
  // left-3/right-3 are just the pre-measurement fallback (and what mobile
  // settles on anyway, see EDGE_INSET below) — the real alignment comes
  // from the measured inline style once mounted.
  bottomLeft: "fixed bottom-4 left-3 z-40 h-56 w-[68%] max-w-xs",
  bottomRight: "fixed bottom-4 right-3 z-40 h-56 w-[68%] max-w-xs",
};

// Small gap from `main`'s actual edge, in px (matches the old left-3/right-3
// Tailwind fallback above).
const EDGE_INSET = 12;

/** A TikTok-live-style stream of wishes drifting up — new bubbles enter at
 * the bottom of a fixed-height box and push older ones up until they age
 * out (capped at MAX_VISIBLE, exit-animated via AnimatePresence rather
 * than just clipped). Source list is dummy wishes always, plus whatever's
 * approved in the real guestbook (fetched once on mount — this is
 * decorative ambience, not a live chat, so a single fetch is enough; no
 * polling). */
export function LiveWishesOverlay({
  projectId,
  position = "default",
}: {
  projectId: string;
  position?: string;
}) {
  const poolRef = useRef<WishItem[]>(DUMMY_WISHES);
  const indexRef = useRef(0);
  const [visible, setVisible] = useState<(WishItem & { key: string })[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [edgeStyle, setEdgeStyle] = useState<CSSProperties | null>(null);

  // For bottomLeft/bottomRight, this element is mounted as `main`'s own
  // first child (see WeddingRenderer.tsx) precisely so it can read `main`'s
  // real on-screen box here — a CSS-only guess (assuming `main` sits
  // centered against the full browser window) breaks anywhere `main` is
  // instead confined to a narrower area, like the admin editor's live
  // preview panel (itself nested inside the dashboard shell's own `<main>`).
  // Measuring the actual parent rect works in both places.
  useEffect(() => {
    if (position !== "bottomLeft" && position !== "bottomRight") return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    function measure() {
      const rect = parent!.getBoundingClientRect();
      setEdgeStyle(
        position === "bottomLeft"
          ? { left: `${rect.left + EDGE_INSET}px` }
          : { right: `${window.innerWidth - rect.right + EDGE_INSET}px` }
      );
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [position]);

  useEffect(() => {
    let cancelled = false;
    getApprovedGuestbookMessages(projectId).then((real) => {
      if (cancelled || real.length === 0) return;
      poolRef.current = [...DUMMY_WISHES, ...real];
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const pool = poolRef.current;
      if (pool.length === 0) return;
      const item = pool[indexRef.current % pool.length];
      indexRef.current += 1;
      setVisible((prev) => {
        const next = [...prev, { ...item, key: `${item.id}-${indexRef.current}` }];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none overflow-hidden px-3 md:px-4 ${
        POSITION_CLASS[position] ?? POSITION_CLASS.default
      }`}
      style={edgeStyle ?? undefined}
      aria-hidden
    >
      <div className="flex h-full flex-col justify-end gap-2">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <motion.div
              key={item.key}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.1, ease: "easeInOut" } }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-fit max-w-full rounded-full bg-ivory/90 px-2 py-1 text-left leading-none shadow-sm backdrop-blur-sm md:px-3 md:py-1.5"
            >
              <span className="font-heading text-xs italic text-accent md:text-sm">{item.name}: </span>
              <span className="font-serif text-sm text-ink md:text-base">{item.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

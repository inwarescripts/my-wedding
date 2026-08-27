"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/** Generic centered modal (Tailwind + framer-motion). Locks body scroll and
 * closes on Escape while open — sibling to Drawer.tsx, use this instead when
 * the content is a short form rather than a scrollable list. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}) {
  // Mounted only on the client — createPortal needs document.body, which
  // doesn't exist during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  // Rendered into document.body via a portal — otherwise a fixed-position
  // ancestor with its own stacking context (e.g. the homepage's `sticky
  // z-20` header) can trap this modal's z-40/z-50 layers underneath other
  // page content instead of above everything, since fixed positioning still
  // stacks relative to the nearest ancestor stacking context, not the
  // whole page.
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              role="dialog"
              aria-modal
              className="w-full max-w-sm border border-line bg-ivory shadow-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-heading text-lg italic text-ink">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng"
                  className="px-1 text-ink-soft transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 py-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

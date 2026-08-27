"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

/** A "Xem bản đồ" trigger + modal, instead of an always-embedded Google
 * Maps iframe sitting inline on the page — the iframe only ever loads once
 * someone actually wants to see it, and the section itself stays compact
 * instead of being dominated by a map box. Shared by MapFrame (the main
 * venue) and Family's per-side maps (separate lễ đường for each family). */
export function MapModalButton({
  label = "Xem bản đồ",
  title,
  lat,
  lng,
  address,
  directionsUrl,
  className,
}: {
  label?: string;
  title: string;
  lat: number;
  lng: number;
  address?: string | null;
  directionsUrl?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-2 border border-ink px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-ivory"
        }
      >
        {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-3">
          {address && (
            <p className="text-center font-serif text-sm text-ink-soft">{address}</p>
          )}
          <div className="aspect-video w-full overflow-hidden border border-line">
            {open && (
              <iframe
                src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                title={`Bản đồ ${title}`}
                loading="lazy"
                className="h-full w-full grayscale-[15%]"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs uppercase tracking-widest text-accent underline underline-offset-2"
            >
              Chỉ đường
            </a>
          )}
        </div>
      </Modal>
    </>
  );
}

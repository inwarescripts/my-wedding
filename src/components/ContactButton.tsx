"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/Modal";

const ZALO_PHONE = "0982377638";

/** "Liên hệ" trigger + QR/Zalo modal, reused in the homepage header (no
 * `demoUrl` — QR points at the site itself) and on each template card
 * (`demoUrl` set — QR points straight at that wedding's demo page so it can
 * be scanned open on a phone). `demoUrl` may be a path (`/wedding/slug`, in
 * dev) or an already-absolute subdomain URL (`https://slug.motdoi.click`,
 * in prod — see lib/site.ts) — only the path form gets the current origin
 * prefixed onto it. */
export function ContactButton({
  demoUrl,
  label = "Liên hệ",
  className,
}: {
  demoUrl?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const qrValue = demoUrl?.startsWith("http")
    ? demoUrl
    : `${origin || "https://motdoi.click"}${demoUrl ?? ""}`;

  function handleOpen(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Liên hệ">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="border border-line bg-white p-3">
            {origin ? (
              <QRCodeSVG value={qrValue} size={168} fgColor="#2b2621" title={qrValue} />
            ) : (
              <div className="h-[168px] w-[168px]" />
            )}
          </div>
          <p className="text-sm text-ink-soft">
            {demoUrl
              ? "Quét mã QR để xem demo trực tiếp trên điện thoại"
              : "Quét mã QR để mở trang trên điện thoại"}
          </p>
          <a
            href={`https://zalo.me/${ZALO_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-85"
          >
            Liên hệ Zalo
          </a>
        </div>
      </Modal>
    </>
  );
}

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
  const [copied, setCopied] = useState(false);

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

  async function handleCopy() {
    await navigator.clipboard.writeText(qrValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
          <button
            type="button"
            onClick={handleCopy}
            disabled={!origin}
            className="flex w-full items-center justify-between gap-3 border border-line bg-ivory-deep/60 px-4 py-2.5 text-left transition-colors hover:border-accent disabled:cursor-default"
          >
            <span className="truncate text-xs text-ink-soft">{qrValue}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-ink">
              {copied ? (
                "Đã copy ✓"
              ) : (
                <>
                  <svg
                    aria-hidden
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy link
                </>
              )}
            </span>
          </button>
          <a
            href={`https://zalo.me/${ZALO_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-85"
          >
            {demoUrl ? "Liên hệ Zalo để tạo mẫu này" : "Liên hệ Zalo"}
          </a>
        </div>
      </Modal>
    </>
  );
}

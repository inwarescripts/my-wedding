"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import type { GiftAccountItem } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";
import { ENVELOPE_IMAGE } from "@/motion/registry/gift";

function GiftCard({
  label,
  bank,
  accountName,
  accountNumber,
  compact = false,
  className = "",
}: GiftAccountItem & { compact?: boolean; className?: string }) {
  const qrValue = `${bank}|${accountNumber}|${accountName}`;

  return (
    <div
      className={`card-flat text-center ${compact ? "px-3 py-5 sm:px-6 sm:py-8" : "px-8 py-10"} ${className}`}
    >
      <p className={`font-script text-accent ${compact ? "text-xl sm:text-2xl" : "text-3xl"}`}>
        {label}
      </p>
      {/* QR codes need solid light/dark contrast to scan regardless of theme. */}
      <div className="mx-auto my-3 flex w-fit justify-center rounded-md bg-white p-2 sm:my-5">
        <QRCodeSVG
          value={qrValue}
          size={compact ? 88 : 132}
          bgColor="transparent"
          fgColor="#2b2621"
        />
      </div>
      <p className={`font-heading text-ink ${compact ? "text-sm sm:text-base" : "text-lg"}`}>
        {bank}
      </p>
      <p className={`mt-1 font-serif text-ink-soft ${compact ? "text-xs sm:text-sm" : ""}`}>
        {accountName}
      </p>
      {/* Plain sans, not the decorative font-serif/tracking-wider used
          elsewhere on this card — a bank account number is meant to be
          scanned/copied digit-by-digit, not read as prose. */}
      <p className={`font-sans tabular-nums text-ink-soft ${compact ? "text-xs sm:text-sm" : "text-base"}`}>
        {accountNumber}
      </p>
    </div>
  );
}

// Shared account-list modal — the default variant opens it inline, the
// envelope variant reveals it on tap. Portalled to <body> like the gallery
// Lightbox, so an ancestor's section transition can't hijack `position: fixed`.
function GiftModal({
  gifts,
  open,
  onClose,
}: {
  gifts: GiftAccountItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/80 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          onClick={onClose}
        >
          <motion.div
            className="relative my-auto w-full max-w-xl rounded-lg bg-ivory p-6"
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-line hover:text-ink"
            >
              ✕
            </button>
            <p className="text-center font-heading text-xl text-ink">Mừng cưới</p>
            {/* flex + justify-center, not grid-cols-2 — with an odd number
                of gift accounts (most often just one), a grid leaves the
                lone/last card stuck in the first column instead of centred
                in the row. */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
              {gifts.map((gift) => (
                <GiftCard key={gift.id} {...gift} compact className="w-[45%] min-w-[150px]" />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

function EnvelopeGift({
  gifts,
  envelopeImage,
}: {
  gifts: GiftAccountItem[];
  envelopeImage: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Section className="text-center">
      <Eyebrow>Mừng cưới</Eyebrow>
      <Divider />
      <p className="mx-auto max-w-md font-serif text-lg text-ink-soft">
        Tình cảm của bạn là điều quý giá nhất. Nhấn vào thiệp để gửi lời chúc
        bằng một món quà nhỏ.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative mx-auto mt-10 flex h-80 w-full max-w-lg items-end justify-center"
        aria-haspopup="dialog"
      >
        {/* Pivot both envelopes from the same bottom point, rotated
            outward, so they read as a "V". */}
        <span className="pointer-events-none absolute right-[22%] top-0 text-2xl text-gold transition-transform duration-500 group-hover:rotate-12">
          ✦
        </span>
        <div className="absolute h-72 w-44 origin-bottom -translate-x-4 -rotate-[16deg] opacity-95 transition-transform duration-500 group-hover:-rotate-[22deg]">
          <div className="wedding-envelope-bounce h-full w-full" style={{ animationDelay: "0s" }}>
            <Image src={envelopeImage} alt="" fill sizes="200px" className="object-contain drop-shadow-xl" />
          </div>
        </div>
        <div className="absolute z-10 h-80 w-48 origin-bottom translate-x-4 rotate-[16deg] transition-transform duration-500 group-hover:rotate-[22deg]">
          <div className="wedding-envelope-bounce h-full w-full" style={{ animationDelay: "0.25s" }}>
            <Image src={envelopeImage} alt="" fill sizes="220px" className="object-contain drop-shadow-2xl" />
          </div>
        </div>
      </button>
      <style>{`
        .wedding-envelope-bounce {
          animation: wedding-envelope-bounce 2.2s ease-in-out infinite;
        }
        @keyframes wedding-envelope-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wedding-envelope-bounce { animation: none; }
        }
      `}</style>

      <p className="mt-6 font-serif text-sm uppercase tracking-widest text-ink-soft/80">
        Nhấn để mở
      </p>

      <GiftModal gifts={gifts} open={open} onClose={() => setOpen(false)} />
    </Section>
  );
}

function DefaultGift({
  gifts,
  bowStyle,
}: {
  gifts: GiftAccountItem[];
  bowStyle: string;
}) {
  return (
    <Section className="text-center">
      <Eyebrow>Mừng cưới</Eyebrow>
      <Divider />
      <BowOrnament variant={bowStyle} className="-mt-2 mb-4" />
      <p className="mx-auto max-w-md font-serif text-lg text-ink-soft">
        Tình cảm của bạn là điều quý giá nhất. Nếu muốn gửi lời chúc bằng một
        món quà nhỏ, chúng tôi xin trân trọng đón nhận.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {gifts.map((gift, i) => (
          <Reveal key={gift.id} preset={i % 2 === 0 ? "fadeRight" : "fadeLeft"}>
            <GiftCard {...gift} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function GiftFrame({
  gifts,
  bowStyle = "none",
  variant = "default",
}: {
  gifts: GiftAccountItem[];
  bowStyle?: string;
  variant?: string;
}) {
  if (variant === "envelope" || variant === "envelopeRed" || variant === "envelopeGreen") {
    return <EnvelopeGift gifts={gifts} envelopeImage={ENVELOPE_IMAGE[variant]} />;
  }
  return <DefaultGift gifts={gifts} bowStyle={bowStyle} />;
}

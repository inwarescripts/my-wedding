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

function GiftCard({
  label,
  bank,
  accountName,
  accountNumber,
  compact = false,
}: GiftAccountItem & { compact?: boolean }) {
  const qrValue = `${bank}|${accountNumber}|${accountName}`;

  return (
    <div className={`card-flat text-center ${compact ? "px-3 py-5 sm:px-6 sm:py-8" : "px-8 py-10"}`}>
      <p className={`font-script text-accent ${compact ? "text-xl sm:text-2xl" : "text-3xl"}`}>
        {label}
      </p>
      <div className="mx-auto my-3 flex justify-center sm:my-5">
        <QRCodeSVG
          value={qrValue}
          size={compact ? 96 : 140}
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
      <p className={`font-serif tracking-wider text-ink-soft ${compact ? "text-xs sm:text-sm" : ""}`}>
        {accountNumber}
      </p>
    </div>
  );
}

// Modal that lists the configured gift accounts — shared between variants:
// the default grid opens the same accounts inline, the envelope variant
// reveals them only once tapped. Portalled to <body> for the same reason as
// the gallery Lightbox (see gallery.tsx) — an ancestor section transition can
// turn `position: fixed` here into "fixed to that ancestor" instead of the
// real viewport.
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
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6">
              {gifts.map((gift) => (
                <GiftCard key={gift.id} {...gift} compact />
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

function EnvelopeGift({ gifts }: { gifts: GiftAccountItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    // Same `ivory-deep` panel tone every other muted section on the site
    // uses, tinted with the theme's own accent via a `multiply` blend —
    // multiply can only ever darken (result per channel ≤ both inputs), so
    // this reliably deepens every theme without the muddy grey a flat
    // black mix gave pale/light themes (their ivory-deep is a pale tint,
    // and blending straight toward black desaturated it instead of
    // enriching it). The ink/ink-soft/accent tokens below were already
    // designed to pair with ivory-deep — darkening it only increases
    // contrast, never breaks it, across both normal and "flipped" dark
    // themes.
    <div
      className="border-y border-line"
      style={{
        backgroundColor: "var(--color-ivory-deep)",
        backgroundImage: "linear-gradient(var(--color-accent), var(--color-accent))",
        backgroundBlendMode: "multiply",
      }}
    >
      <Section className="text-center">
        {/* Text here is a fixed warm cream/gold, not the page's ink/accent
            tokens — this panel's background is deliberately darkened below
            what those tokens are calibrated for (they're paired with plain
            ivory-deep), and "ink" flips between dark and light text
            depending on the theme, so it can land as plain black on a
            still-fairly-light multiplied background. A fixed light palette
            keeps this card reading like a consistent envelope/gift card in
            every theme instead of sometimes mismatching. */}
        <p className="mb-3 font-script text-3xl leading-none text-gold md:text-4xl">Mừng cưới</p>
        <Divider />
        <p className="mx-auto max-w-md font-serif text-lg text-[#f6ead0]">
          Tình cảm của bạn là điều quý giá nhất. Nhấn vào thiệp để gửi lời chúc
          bằng một món quà nhỏ.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative mx-auto mt-10 flex h-56 w-full max-w-xs items-end justify-center"
          aria-haspopup="dialog"
        >
          {/* Two envelopes pivoting from the same bottom point, rotated
              outward in opposite directions — tips meet at the bottom,
              tops flare apart, reading as a "V". */}
          <span className="pointer-events-none absolute right-[22%] top-0 text-2xl text-gold transition-transform duration-500 group-hover:rotate-12">
            ✦
          </span>
          <div className="absolute h-48 w-32 origin-bottom -translate-x-4 -rotate-[16deg] opacity-95 transition-transform duration-500 group-hover:-rotate-[22deg]">
            <Image src="/thiep.webp" alt="" fill sizes="140px" className="object-contain drop-shadow-xl" />
          </div>
          <div className="absolute z-10 h-56 w-36 origin-bottom translate-x-4 rotate-[16deg] transition-transform duration-500 group-hover:rotate-[22deg]">
            <Image src="/thiep.webp" alt="" fill sizes="160px" className="object-contain drop-shadow-2xl" />
          </div>
        </button>

        <p className="mt-6 font-serif text-sm uppercase tracking-widest text-[#f6ead0]/80">
          Nhấn để mở
        </p>
      </Section>

      <GiftModal gifts={gifts} open={open} onClose={() => setOpen(false)} />
    </div>
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
    <div className="border-y border-line bg-ivory-deep">
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
    </div>
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
  if (variant === "envelope") return <EnvelopeGift gifts={gifts} />;
  return <DefaultGift gifts={gifts} bowStyle={bowStyle} />;
}

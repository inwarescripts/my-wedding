"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { RsvpContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";
import { submitRsvp, type SubmitState } from "@/app/actions/public";

const inputClass =
  "w-full border-0 border-b border-line bg-transparent px-1 py-3 font-serif text-lg text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none";

function RsvpForm({
  projectId,
  content,
}: {
  projectId: string;
  content: RsvpContent;
}) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitRsvp.bind(null, projectId),
    undefined
  );

  if (state?.success) {
    return (
      <div className="card-flat px-8 py-12 text-center">
        <p className="font-heading text-2xl italic text-ink">Cảm ơn bạn!</p>
        <p className="mt-2 font-serif text-ink-soft">
          Chúng tôi đã nhận được phản hồi của bạn.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 text-left">
      <input required name="name" placeholder="Họ và tên" className={inputClass} />
      <input name="phone" placeholder="Số điện thoại" className={inputClass} />

      <div className="flex gap-3 pt-2">
        <label className="flex-1">
          <input type="radio" name="attending" value="yes" defaultChecked className="peer sr-only" />
          <span className="block cursor-pointer border border-line px-4 py-3 text-center text-sm tracking-widest uppercase text-ink-soft transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ivory">
            Sẽ tham dự
          </span>
        </label>
        <label className="flex-1">
          <input type="radio" name="attending" value="no" className="peer sr-only" />
          <span className="block cursor-pointer border border-line px-4 py-3 text-center text-sm tracking-widest uppercase text-ink-soft transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ivory">
            Xin phép vắng
          </span>
        </label>
      </div>

      {content.showGuestCount && (
        <label className="block">
          <span className="mb-1 block text-xs tracking-[0.2em] uppercase text-ink-soft">
            Số lượng khách
          </span>
          <input
            name="guestCount"
            type="number"
            min={1}
            defaultValue={1}
            className={inputClass}
          />
        </label>
      )}

      {content.showMessage && (
        <textarea
          name="message"
          placeholder="Lời nhắn gửi đến cô dâu chú rể"
          rows={3}
          className={inputClass}
        />
      )}

      {state?.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-ink bg-ink py-4 text-sm tracking-[0.2em] uppercase text-ivory transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "Đang gửi..." : "Gửi xác nhận"}
      </button>
    </form>
  );
}

// Same portal pattern as GiftFrame's GiftModal — <body>-portalled so an
// ancestor section transition can't hijack `position: fixed`.
function RsvpModal({
  projectId,
  content,
  open,
  onClose,
}: {
  projectId: string;
  content: RsvpContent;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const modalContent = (
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
            className="relative my-auto w-full max-w-md rounded-lg bg-ivory p-6"
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
            <p className="mb-6 text-center font-heading text-xl text-ink">
              Xác nhận tham dự
            </p>
            <RsvpForm projectId={projectId} content={content} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

// Shared, no-decoration intro for the two newer variants below — neither
// uses the floating rose bouquet, which the same fixed image on every
// variant made feel repetitive/dated.
function RsvpIntroPlain() {
  return (
    <>
      <Eyebrow>Xác nhận tham dự</Eyebrow>
      <Divider />
      <p className="mx-auto max-w-md font-serif text-lg text-ink-soft">
        Sự hiện diện của bạn là món quà quý giá nhất với chúng tôi
      </p>
    </>
  );
}

/** Minimalist — no bouquet, no ornament, just a clean bordered card around
 * the form. Reads as a modern, understated invitation rather than a
 * florid one. */
function ElegantRsvp({ projectId, content }: { projectId: string; content: RsvpContent }) {
  return (
    <Section className="text-center">
      <RsvpIntroPlain />
      <Reveal
        preset="fadeUp"
        className="mx-auto mt-10 max-w-md border border-line px-8 py-10 text-left"
      >
        <RsvpForm projectId={projectId} content={content} />
      </Reveal>
    </Section>
  );
}

/** Real flower photos framing opposite corners of the form card — same
 * asset pair and technique as the Story/Family sections' "floral photo"
 * treatments, instead of one fixed bouncing rose PNG. */
function FloralRsvp({ projectId, content }: { projectId: string; content: RsvpContent }) {
  return (
    <Section className="text-center">
      <RsvpIntroPlain />
      <div className="relative mx-auto mt-10 max-w-md">
        <div className="pointer-events-none absolute -right-10 -top-10 z-10 h-32 w-32 sm:-right-12 sm:-top-12 sm:h-40 sm:w-40">
          <Image
            src="/flower1-decoration.webp"
            alt=""
            fill
            sizes="160px"
            className="object-contain drop-shadow-[0_8px_16px_rgba(43,38,33,0.18)]"
          />
        </div>
        <div className="pointer-events-none absolute -bottom-10 -left-10 z-10 h-36 w-36 sm:-bottom-12 sm:-left-12 sm:h-44 sm:w-44">
          <Image
            src="/flower3-decoration.webp"
            alt=""
            fill
            sizes="180px"
            className="object-contain drop-shadow-[0_8px_16px_rgba(43,38,33,0.18)]"
          />
        </div>
        <Reveal
          preset="fadeUp"
          className="relative border border-accent-soft/70 bg-ivory px-8 py-10 text-left"
        >
          <RsvpForm projectId={projectId} content={content} />
        </Reveal>
      </div>
    </Section>
  );
}

function RsvpIntro({ bowStyle }: { bowStyle: string }) {
  return (
    <>
      <Reveal preset="fadeUp" className="mx-auto mb-2 h-28 w-28 md:h-32 md:w-32">
        <div className="wedding-bouquet-float relative h-full w-full">
          <Image
            src="/flower/hoahong.png"
            alt=""
            fill
            sizes="128px"
            className="object-contain drop-shadow-[0_10px_18px_rgba(43,38,33,0.2)]"
          />
        </div>
      </Reveal>
      <Eyebrow>Xác nhận tham dự</Eyebrow>
      <Divider />
      <BowOrnament variant={bowStyle} className="-mt-2 mb-4" />
      <style>{`
        .wedding-bouquet-float {
          animation: wedding-bouquet-float 5s ease-in-out infinite;
        }
        @keyframes wedding-bouquet-float {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wedding-bouquet-float { animation: none; }
        }
      `}</style>
      <p className="mx-auto max-w-md font-serif text-lg text-ink-soft">
        Sự hiện diện của bạn là món quà quý giá nhất với chúng tôi
      </p>
    </>
  );
}

export function RSVP({
  projectId,
  content,
  bowStyle = "none",
  variant = "form",
}: {
  projectId: string;
  content: RsvpContent;
  bowStyle?: string;
  variant?: string;
}) {
  const [open, setOpen] = useState(false);

  if (variant === "elegant") {
    return <ElegantRsvp projectId={projectId} content={content} />;
  }

  if (variant === "floral") {
    return <FloralRsvp projectId={projectId} content={content} />;
  }

  if (variant === "modal") {
    return (
      <Section className="text-center">
        <RsvpIntro bowStyle={bowStyle} />

        <Reveal preset="fadeUp" className="mx-auto mt-10 max-w-md">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full border border-ink bg-ink py-4 text-sm tracking-[0.2em] uppercase text-ivory transition-opacity hover:opacity-85"
          >
            Xác nhận tham dự
          </button>
        </Reveal>

        <RsvpModal
          projectId={projectId}
          content={content}
          open={open}
          onClose={() => setOpen(false)}
        />
      </Section>
    );
  }

  return (
    <Section className="text-center">
      <RsvpIntro bowStyle={bowStyle} />
      <Reveal preset="fadeUp" className="mx-auto mt-10 max-w-md text-left">
        <RsvpForm projectId={projectId} content={content} />
      </Reveal>
    </Section>
  );
}

"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { RsvpContent } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";
import { submitRsvp, type SubmitState } from "@/app/actions/public";

const inputClass =
  "w-full border-0 border-b border-line bg-transparent px-1 py-3 font-serif text-lg text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none";

export function RSVP({
  projectId,
  content,
  bowStyle = "none",
}: {
  projectId: string;
  content: RsvpContent;
  bowStyle?: string;
}) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitRsvp.bind(null, projectId),
    undefined
  );

  return (
    <div className="border-y border-line bg-ivory-deep">
    <Section className="text-center">
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

      <Reveal preset="fadeUp" className="mx-auto mt-10 max-w-md text-left">
        {state?.success ? (
          <div className="card-flat px-8 py-12 text-center">
            <p className="font-heading text-2xl italic text-ink">Cảm ơn bạn!</p>
            <p className="mt-2 font-serif text-ink-soft">
              Chúng tôi đã nhận được phản hồi của bạn.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-6">
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
        )}
      </Reveal>
    </Section>
    </div>
  );
}

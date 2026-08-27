"use client";

import { useActionState } from "react";
import type { GuestbookItem } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";
import { submitGuestbookMessage, type SubmitState } from "@/app/actions/public";

// Alternate a faint tilt per card, postcard-pinned-to-a-board style, instead
// of a rigid grid of identical rectangles — repeats every 4 cards so it
// still reads as a deliberate pattern rather than random jitter.
const TILTS = ["-rotate-1", "rotate-1", "rotate-1", "-rotate-1"];

export function Guestbook({
  projectId,
  seed,
}: {
  projectId: string;
  seed: GuestbookItem[];
}) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitGuestbookMessage.bind(null, projectId),
    undefined
  );

  return (
    <Section className="text-center">
      <Eyebrow>Sổ lưu bút</Eyebrow>
      <Divider />
      <BowOrnament variant="simple" className="-mt-2 mb-6" />

      <Reveal preset="fadeUp" className="mx-auto max-w-md">
        <div className="card-flat px-6 py-8 text-left sm:px-8">
          {state?.success ? (
            <p className="text-center font-serif text-ink-soft">
              Cảm ơn lời chúc của bạn! Lời chúc sẽ hiển thị sau khi được duyệt.
            </p>
          ) : (
            <form action={formAction} className="space-y-4">
              <p className="text-center font-script text-2xl text-accent">
                Gửi lời chúc phúc
              </p>
              <input
                name="name"
                required
                placeholder="Tên của bạn"
                className="w-full border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
              />
              <textarea
                name="message"
                required
                placeholder="Gửi lời chúc mừng..."
                rows={3}
                className="w-full border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
              />
              {state?.error && (
                <p className="text-sm text-red-700" role="alert">
                  {state.error}
                </p>
              )}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={pending}
                  className="border border-ink px-8 py-2.5 text-xs tracking-[0.2em] uppercase text-ink transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50"
                >
                  {pending ? "Đang gửi..." : "Gửi lời chúc"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Reveal>

      <Stagger className="mx-auto mt-14 grid max-w-4xl gap-x-6 gap-y-10 text-left sm:grid-cols-2">
        {seed.map((m, i) => (
          <StaggerItem
            key={m.id}
            className={`card-flat relative px-6 pb-6 pt-9 transition-transform duration-300 hover:rotate-0 hover:shadow-md ${TILTS[i % TILTS.length]}`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-0 font-script text-7xl leading-none text-accent-soft/70"
            >
              “
            </span>
            <div className="relative flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft/25 font-heading text-sm text-accent">
                {m.name.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <div>
                <p className="font-heading italic text-ink">{m.name}</p>
                <p className="mt-1 font-serif text-ink-soft">{m.message}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

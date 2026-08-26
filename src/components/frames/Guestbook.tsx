"use client";

import { useActionState } from "react";
import type { GuestbookItem } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/motion/Reveal";
import { submitGuestbookMessage, type SubmitState } from "@/app/actions/public";

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

      <Reveal preset="fadeUp" className="mx-auto max-w-md text-left">
        {state?.success ? (
          <p className="font-serif text-ink-soft">
            Cảm ơn lời chúc của bạn! Lời chúc sẽ hiển thị sau khi được duyệt.
          </p>
        ) : (
          <form action={formAction} className="space-y-3">
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
              rows={2}
              className="w-full border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
            />
            {state?.error && (
              <p className="text-sm text-red-700" role="alert">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="border border-ink px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-ink transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50"
            >
              {pending ? "Đang gửi..." : "Gửi lời chúc"}
            </button>
          </form>
        )}
      </Reveal>

      <Stagger className="mx-auto mt-12 grid max-w-3xl gap-4 text-left md:grid-cols-2">
        {seed.map((m) => (
          <StaggerItem key={m.id} className="card-flat px-6 py-5">
            <p className="font-heading italic text-ink">{m.name}</p>
            <p className="mt-1 font-serif text-ink-soft">{m.message}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

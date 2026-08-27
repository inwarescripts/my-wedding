"use client";

import { QRCodeSVG } from "qrcode.react";
import type { GiftAccountItem } from "@/types/wedding-config";
import { Section, Eyebrow, Divider } from "@/components/ui/Section";
import { Reveal } from "@/motion/Reveal";
import { BowOrnament } from "@/motion/registry/bow";

function GiftCard({ label, bank, accountName, accountNumber }: GiftAccountItem) {
  const qrValue = `${bank}|${accountNumber}|${accountName}`;

  return (
    <div className="card-flat px-8 py-10 text-center">
      <p className="font-script text-3xl text-accent">{label}</p>
      <div className="mx-auto my-5 flex justify-center">
        <QRCodeSVG value={qrValue} size={140} bgColor="transparent" fgColor="#2b2621" />
      </div>
      <p className="font-heading text-lg text-ink">{bank}</p>
      <p className="mt-1 font-serif text-ink-soft">{accountName}</p>
      <p className="font-serif tracking-wider text-ink-soft">{accountNumber}</p>
    </div>
  );
}

export function GiftFrame({
  gifts,
  bowStyle = "none",
}: {
  gifts: GiftAccountItem[];
  bowStyle?: string;
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

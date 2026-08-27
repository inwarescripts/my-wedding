import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedProjectsGallery } from "@/lib/wedding-config";
import { Reveal, Stagger, StaggerItem } from "@/motion/Reveal";
import { AnimatedHeading } from "@/motion/registry/typography";
import { AmbientEffect } from "@/motion/registry/ambient";
import { LandingHeroBackground } from "@/components/LandingHeroBackground";
import { ContactButton } from "@/components/ContactButton";

const TITLE =
  "Thiệp cưới online đẹp như phim — Tạo website cưới miễn phí trong vài phút";
const DESCRIPTION =
  "Wedding Studio giúp bạn tạo thiệp mời cưới online, website cưới cá nhân hoá đẹp như phim trong vài phút — không cần biết code. Miễn phí dùng thử, có RSVP, sổ lưu bút, mừng cưới online, nhạc nền, hiệu ứng 3D.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function Home() {
  const projects = await getPublishedProjectsGallery();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Wedding Studio",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click",
    description: DESCRIPTION,
    inLanguage: "vi-VN",
  };

  return (
    <div className="bg-ivory">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line/0 bg-ivory/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <span className="font-script text-2xl text-accent">Wedding Studio</span>
          <div className="flex items-center gap-2">
            <ContactButton
              className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
            />
            <Link
              href="/admin/login"
              className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-10 text-center md:pb-32 md:pt-16">
        <LandingHeroBackground />
        <AmbientEffect variant="sparkle" />
        <div className="relative z-10">
          <Reveal preset="fade">
            <p className="font-script text-3xl text-accent md:text-4xl">
              Câu chuyện của bạn, kể bằng hình ảnh
            </p>
          </Reveal>
          <Reveal preset="fade" delay={0.05}>
            <span className="mx-auto mt-3 block h-px w-14 bg-accent-soft" />
          </Reveal>
          <AnimatedHeading
            as="h1"
            variant="wordReveal"
            className="mx-auto mt-4 max-w-3xl font-heading text-4xl italic leading-[1.15] text-ink md:text-6xl"
          >
            Website cưới đẹp như phim, dựng xong trong vài phút
          </AnimatedHeading>
          <Reveal preset="fadeUp" delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg text-ink-soft md:text-xl">
              Chọn một mẫu thiệp, đổi ảnh và nội dung của riêng bạn, rồi gửi cho
              khách mời một trải nghiệm mời cưới trực tuyến mượt mà, tinh tế —
              không cần biết code.
            </p>
          </Reveal>
          <Reveal preset="fade" delay={0.3}>
            <a
              href="#templates"
              className="mt-10 inline-flex items-center gap-3 border border-ink px-8 py-4 text-sm uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-ivory"
            >
              Xem các mẫu thiệp
              <span aria-hidden>↓</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* Template gallery */}
      <section id="templates" className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-script text-3xl text-accent md:text-4xl">
              Chọn mẫu & Tạo thiệp mời của bạn
            </p>
            <p className="mx-auto mt-3 max-w-md font-serif text-ink-soft">
              Mỗi mẫu là một website cưới thật, xem demo trực tiếp trước khi
              quyết định.
            </p>
          </div>

          <Stagger className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            <StaggerItem preset="fadeUp">
              <Link
                href="/admin/login"
                className="group flex h-full flex-col overflow-hidden border border-dashed border-accent-soft bg-ivory-deep/60 transition-colors hover:border-accent"
              >
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 px-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-soft via-accent to-accent-soft text-2xl text-ivory shadow-sm">
                    ✨
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-accent">
                      Chưa có mẫu
                    </p>
                    <p className="mt-2 font-heading text-2xl italic text-ink">
                      Tạo thiệp mới
                    </p>
                    <p className="mt-2 font-serif text-sm text-ink-soft">
                      Bắt đầu nhanh với trình thiết kế.
                    </p>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-2 border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors group-hover:bg-ink group-hover:text-ivory">
                    Thiết kế ngay
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </StaggerItem>
            {projects.map((project) => (
              <StaggerItem key={project.slug} preset="fadeUp">
                <div className="group">
                  <Link href={`/wedding/${project.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep shadow-flat transition-shadow duration-500 group-hover:shadow-[0_20px_40px_-16px_rgb(43_38_33_/_0.25)]">
                      {project.coverImage && (
                        <Image
                          src={project.coverImage}
                          alt={project.displayName}
                          fill
                          // Deliberately larger than the card's real ~362px
                          // render width — leaves headroom for the hover
                          // scale-[1.04] transform and fractional desktop DPR
                          // (125%/150% Windows scaling) so the image is never
                          // upsampled past its own source resolution.
                          sizes="(min-width: 1024px) 500px, (min-width: 640px) 60vw, 100vw"
                          quality={100}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      )}
                      {/* Darken only the lower third so the photo itself stays
                          bright and crisp instead of muddied edge-to-edge. */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                      <span className="absolute right-4 top-4 border border-ivory/40 bg-ink/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-sm">
                        Live
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                        <p className="font-heading text-2xl italic drop-shadow-sm">
                          {project.displayName}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/85">
                          <span className="h-px w-4 bg-ivory/50" />
                          {formatDate(project.weddingDate)}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between border-b border-line pb-4 pt-4 transition-colors group-hover:border-accent">
                    <Link
                      href={`/wedding/${project.slug}`}
                      className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors group-hover:text-ink"
                    >
                      Xem demo
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                        →
                      </span>
                    </Link>
                    <ContactButton
                      demoUrl={`/wedding/${project.slug}`}
                      label="Chi tiết"
                      className="text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
                    />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-line bg-ivory-deep px-6 py-20 text-center md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-accent-soft"
        />
        <Reveal preset="fadeUp">
          <span className="font-script text-2xl text-accent">Mỗi câu chuyện đều đáng kể</span>
          <p className="mx-auto mt-3 max-w-lg font-heading text-3xl italic text-ink md:text-4xl">
            Sẵn sàng kể câu chuyện của riêng bạn?
          </p>
          <p className="mx-auto mt-4 max-w-md font-serif text-ink-soft">
            Tạo website cưới của bạn ngay hôm nay — đẹp, mượt, và mang đúng
            dấu ấn của hai bạn.
          </p>
          <Link
            href="/admin/login"
            className="mt-8 inline-block border border-ink bg-ink px-10 py-4 text-sm uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-85"
          >
            Bắt đầu tạo thiệp
          </Link>
        </Reveal>
      </section>

      <footer className="flex items-center justify-center gap-3 border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        <span className="font-script text-base text-accent">W</span>
        © {new Date().getFullYear()} Wedding Studio.
      </footer>
    </div>
  );
}

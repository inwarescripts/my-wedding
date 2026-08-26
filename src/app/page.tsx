import Link from "next/link";
import Image from "next/image";
import { getPublishedProjectsGallery } from "@/lib/wedding-config";
import { Reveal, Stagger, StaggerItem } from "@/motion/Reveal";
import { AnimatedHeading } from "@/motion/registry/typography";
import { AmbientEffect } from "@/motion/registry/ambient";
import { LandingHeroBackground } from "@/components/LandingHeroBackground";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function Home() {
  const projects = await getPublishedProjectsGallery();

  return (
    <div className="bg-ivory">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <span className="font-script text-2xl text-accent">Wedding Studio</span>
        <Link
          href="/admin/login"
          className="text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
        >
          Đăng nhập
        </Link>
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

          <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                <Link
                  href={`/wedding/${project.slug}`}
                  className="group block overflow-hidden border border-line bg-ivory"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {project.coverImage && (
                      <Image
                        src={project.coverImage}
                        alt={project.displayName}
                        fill
                        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 45vw, 90vw"
                        quality={90}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                      <p className="font-heading text-2xl italic">
                        {project.displayName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ivory/80">
                        {formatDate(project.weddingDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                      Xem demo
                    </span>
                    <span className="text-ink transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line bg-ivory-deep px-6 py-20 text-center md:py-28">
        <Reveal preset="fadeUp">
          <p className="font-heading text-3xl italic text-ink md:text-4xl">
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

      <footer className="px-6 py-8 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} Wedding Studio.
      </footer>
    </div>
  );
}

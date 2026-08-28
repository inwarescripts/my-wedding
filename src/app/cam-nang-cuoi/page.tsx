import type { Metadata } from "next";
import Link from "next/link";
import { weddingGuides } from "@/data/wedding-guides";

const TITLE = "Cẩm nang cưới — Kinh nghiệm chuẩn bị đám cưới từ A-Z";
const DESCRIPTION =
  "Tổng hợp kinh nghiệm chuẩn bị đám cưới: lễ ăn hỏi cần gì, nhà trai nhà gái chuẩn bị ra sao, thứ tự các nghi lễ cưới hỏi truyền thống Việt Nam — cập nhật liên tục.";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}/cam-nang-cuoi` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${baseUrl}/cam-nang-cuoi`,
    type: "website",
    locale: "vi_VN",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CamNangCuoiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${baseUrl}/cam-nang-cuoi`,
    hasPart: weddingGuides.map((g) => ({
      "@type": "Article",
      headline: g.title,
      url: `${baseUrl}/cam-nang-cuoi/${g.slug}`,
      datePublished: g.publishedAt,
    })),
  };

  return (
    <div className="bg-ivory min-h-screen">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-20 border-b border-line/50 bg-ivory/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="font-script text-2xl text-accent">
            Wedding Studio Một Đời
          </Link>
          <Link
            href="/"
            className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
          >
            Về trang chủ
          </Link>
        </div>
      </header>

      <section className="px-6 py-16 text-center md:px-10 md:py-20">
        <p className="font-script text-3xl text-accent md:text-4xl">Cẩm nang cưới</p>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-3xl italic text-ink md:text-5xl">
          Kinh nghiệm chuẩn bị đám cưới từ A-Z
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-serif text-ink-soft">
          Những điều cô dâu chú rể và hai gia đình cần biết trước ngày trọng đại — cập nhật liên tục.
        </p>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          {weddingGuides.map((g) => (
            <Link
              key={g.slug}
              href={`/cam-nang-cuoi/${g.slug}`}
              className="group flex flex-col border border-line bg-white/60 p-6 shadow-flat transition-colors hover:border-accent"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-accent">
                {formatDate(g.publishedAt)} · {g.readMinutes} phút đọc
              </span>
              <h2 className="mt-3 font-heading text-xl italic text-ink group-hover:text-accent">
                {g.title}
              </h2>
              <p className="mt-2 flex-1 font-serif text-sm text-ink-soft">{g.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft group-hover:text-ink">
                Đọc tiếp
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-center gap-3 border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        <span className="font-script text-base text-accent">W</span>
        © {new Date().getFullYear()} Wedding Studio Một Đời.
      </footer>
    </div>
  );
}

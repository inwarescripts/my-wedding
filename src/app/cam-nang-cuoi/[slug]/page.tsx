import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { weddingGuides, getWeddingGuide } from "@/data/wedding-guides";
import { guideArticles } from "@/data/guide-articles";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click";

export function generateStaticParams() {
  return weddingGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getWeddingGuide(slug);
  if (!guide) return {};

  const url = `${baseUrl}/cam-nang-cuoi/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.excerpt,
    keywords: guide.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      url,
      type: "article",
      locale: "vi_VN",
      publishedTime: guide.publishedAt,
    },
    twitter: {
      card: "summary",
      title: guide.title,
      description: guide.excerpt,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getWeddingGuide(slug);
  const Article = guideArticles[slug];
  if (!guide || !Article) notFound();

  const url = `${baseUrl}/cam-nang-cuoi/${guide.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    keywords: guide.keywords.join(", "),
    datePublished: guide.publishedAt,
    url,
    author: { "@type": "Organization", name: "Wedding Studio Một Đời" },
    publisher: { "@type": "Organization", name: "Wedding Studio Một Đời" },
    mainEntityOfPage: url,
  };

  const related = weddingGuides.filter((g) => g.slug !== guide.slug).slice(0, 3);

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
            href="/cam-nang-cuoi"
            className="border border-ink/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-line hover:text-ink"
          >
            ← Cẩm nang cưới
          </Link>
        </div>
      </header>

      <article className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">
            {formatDate(guide.publishedAt)} · {guide.readMinutes} phút đọc
          </span>
          <h1 className="mt-3 font-heading text-3xl italic text-ink md:text-4xl">{guide.title}</h1>
          <p className="mt-4 font-serif text-lg text-ink-soft">{guide.excerpt}</p>

          <div className="mt-10 border-t border-line/50 pt-8">
            <Article />
          </div>

          <div className="mt-12 border-t border-line/50 pt-8 text-center">
            <p className="font-serif text-ink-soft">
              Đã sẵn sàng cho ngày trọng đại? Tạo ngay một thiệp mời cưới online đẹp như phim.
            </p>
            <Link
              href="/#templates"
              className="mt-4 inline-block border border-ink bg-ink px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-85"
            >
              Xem mẫu thiệp mời
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line/50 bg-ivory-deep px-6 py-16 md:px-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-heading text-xl italic text-ink">Bài viết liên quan</h2>
            <ul className="mt-6 space-y-4">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/cam-nang-cuoi/${g.slug}`}
                    className="group flex items-center justify-between gap-4 border-b border-line/50 pb-4 text-ink transition-colors hover:text-accent"
                  >
                    <span className="font-serif text-base">{g.title}</span>
                    <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <footer className="flex items-center justify-center gap-3 border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        <span className="font-script text-base text-accent">W</span>
        © {new Date().getFullYear()} Wedding Studio Một Đời.
      </footer>
    </div>
  );
}

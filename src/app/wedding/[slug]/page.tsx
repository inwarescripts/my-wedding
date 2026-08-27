import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingRenderer } from "@/components/WeddingRenderer";
import { getPublishedWeddingConfigBySlug } from "@/lib/wedding-config";
import { getDemoUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const config = await getPublishedWeddingConfigBySlug(decodedSlug);
  if (!config) return { title: "Không tìm thấy thiệp cưới" };

  const title = `Thiệp cưới ${config.couple.displayName} | Save The Date`;
  const weddingDate = new Date(config.couple.weddingDate).toLocaleDateString("vi-VN");
  const description =
    config.couple.quote ??
    `Chạm để mở câu chuyện tình yêu của ${config.couple.displayName} — ${weddingDate}. Xem thông tin lễ cưới, gửi lời chúc và xác nhận tham dự ngay.`;
  const canonicalUrl = getDemoUrl(decodedSlug);

  return {
    title,
    description,
    // getDemoUrl() returns an absolute https://slug.motdoi.click URL in prod
    // (each couple's own subdomain) or a relative /wedding/slug path in dev
    // — Next resolves the latter against metadataBase set in the root
    // layout, so this works in both cases.
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "vi_VN",
      images: config.couple.coverImage ? [{ url: config.couple.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function WeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const config = await getPublishedWeddingConfigBySlug(decodedSlug);

  if (!config) notFound();

  const firstEvent = config.events[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Lễ cưới ${config.couple.displayName}`,
    startDate: config.couple.weddingDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description:
      config.couple.quote ?? `Thiệp mời cưới online của ${config.couple.displayName}`,
    image: config.couple.coverImage ? [config.couple.coverImage] : undefined,
    url: getDemoUrl(decodedSlug),
    location: firstEvent
      ? {
          "@type": "Place",
          name: firstEvent.venue,
          address: firstEvent.address ?? undefined,
        }
      : undefined,
    performer: [
      { "@type": "Person", name: config.couple.groomName },
      { "@type": "Person", name: config.couple.brideName },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WeddingRenderer config={config} />
    </>
  );
}

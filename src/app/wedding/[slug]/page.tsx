import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingRenderer } from "@/components/WeddingRenderer";
import { getPublishedWeddingConfigBySlug } from "@/lib/wedding-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = await getPublishedWeddingConfigBySlug(decodeURIComponent(slug));
  if (!config) return { title: "Không tìm thấy thiệp cưới" };

  const title = `${config.couple.displayName} | Thiệp cưới`;
  const weddingDate = new Date(config.couple.weddingDate).toLocaleDateString("vi-VN");
  const description =
    config.couple.quote ??
    `Chạm để mở câu chuyện tình yêu của ${config.couple.displayName} — ${weddingDate}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      images: config.couple.coverImage ? [{ url: config.couple.coverImage }] : undefined,
    },
  };
}

export default async function WeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = await getPublishedWeddingConfigBySlug(decodeURIComponent(slug));

  if (!config) notFound();

  return <WeddingRenderer config={config} />;
}

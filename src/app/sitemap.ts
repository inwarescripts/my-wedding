import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { weddingGuides } from "@/data/wedding-guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/cam-nang-cuoi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...weddingGuides.map((g) => ({
      url: `${SITE_URL}/cam-nang-cuoi/${g.slug}`,
      lastModified: new Date(g.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...projects.map((p) => ({
      // encodeURI, not encodeURIComponent — slugs with Vietnamese
      // diacritics need percent-encoding to be valid inside a sitemap
      // <loc>, but "/" must stay literal.
      url: encodeURI(`${SITE_URL}/wedding/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

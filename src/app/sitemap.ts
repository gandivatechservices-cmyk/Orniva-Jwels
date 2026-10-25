import type { MetadataRoute } from "next";
import { SITE_URL, STATIC_PAGES, seoApi } from "lib/seo";

export const revalidate = 3600;

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...Object.values(STATIC_PAGES).map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
  ];

  const categories = (await seoApi.categories()) ?? [];
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE_URL}/category/${encodeURIComponent(c.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const productRoutes: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await seoApi.products(page, PAGE_SIZE);
    if (!res?.items?.length) break;
    for (const p of res.items) {
      if (!p.isActive) continue;
      productRoutes.push({
        url: `${SITE_URL}/products/${encodeURIComponent(p._id)}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
        ...(p.images?.[0] ? { images: [p.images[0]] } : {}),
      });
    }
    if (productRoutes.length >= res.total || res.items.length < PAGE_SIZE) break;
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

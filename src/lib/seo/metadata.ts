import type { Metadata } from "next";
import type { Category, Product } from "utility/services/catalog";
import { SITE_NAME, toSnippet } from "./config";
import { STATIC_PAGES, type StaticPageKey } from "./routes";

export const NOT_FOUND_METADATA = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: true },
});

export function staticPageMetadata(key: StaticPageKey): Metadata {
  const { title, description, path } = STATIC_PAGES[key];
  return { title, description, alternates: { canonical: path } };
}

export function productMetadata(product: Product): Metadata {
  const title = product.brand ? `${product.name} by ${product.brand}` : product.name;
  const description =
    toSnippet(product.description) ||
    `Buy ${product.name} online at ${SITE_NAME}. Fresh groceries delivered across the UK.`;
  const image = product.images?.[0];
  const path = `/products/${encodeURIComponent(product._id)}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function categoryMetadata(category: Category): Metadata {
  const description =
    toSnippet(category.description) ||
    `Shop ${category.name} online at ${SITE_NAME}. Quality groceries delivered across the UK.`;
  const path = `/category/${encodeURIComponent(category.slug)}`;

  return {
    title: `${category.name} - Buy Online`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description,
      url: path,
      ...(category.imageUrl ? { images: [{ url: category.imageUrl, alt: category.name }] } : {}),
    },
  };
}

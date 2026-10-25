export const SITE_NAME = "Atlas Groceries";

export const SITE_DESCRIPTION =
  "Shop fresh food, pantry staples and specialty groceries online at Atlas Groceries, with delivery across the United Kingdom.";

/** Public site URL. Set NEXT_PUBLIC_SITE_URL in production (e.g. https://shop.atlassone.com). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://shop.atlassone.com").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trim text to a search-result friendly length without cutting a word in half. */
export function toSnippet(text: string | undefined, max = 155): string {
  const clean = (text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

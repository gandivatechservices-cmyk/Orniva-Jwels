import type { Category, Product } from "utility/services/catalog";
import { SITE_NAME, SITE_URL, absoluteUrl, toSnippet } from "./config";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function productJsonLd(product: Product, currency: string, category?: Category) {
  const variantPrices = product.variants?.map((v) => v.price).filter((p) => p > 0) ?? [];
  const price = variantPrices.length ? Math.min(...variantPrices) : product.basePrice;
  const inStock = product.variants?.length ? product.variants.some((v) => v.stock > 0) : true;
  const productUrl = absoluteUrl(`/products/${encodeURIComponent(product._id)}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: toSnippet(product.description, 500) || undefined,
        image: product.images?.length ? product.images : undefined,
        sku: product.variants?.[0]?.sku || product._id,
        brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
        category: category?.name,
        offers: {
          "@type": "Offer",
          url: productUrl,
          price: Number(price).toFixed(2),
          priceCurrency: currency,
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          ...(category
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: category.name,
                  item: absoluteUrl(`/category/${encodeURIComponent(category.slug)}`),
                },
              ]
            : []),
          { "@type": "ListItem", position: category ? 3 : 2, name: product.name },
        ],
      },
    ],
  };
}

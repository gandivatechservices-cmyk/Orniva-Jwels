import type { Catalog, Product } from "utility/services/catalog";

export type CatalogShowcase = {
  catalog: Catalog;
  /** The catalog's cover image from the database. */
  image?: string;
  productCount: number;
};

/** Active catalogs that have at least one active product, each with a product count and a picture. */
export function buildCatalogShowcase(catalogs: Catalog[], products: Product[]): CatalogShowcase[] {
  return catalogs
    .filter((c) => c.isActive !== false)
    .map((catalog) => {
      const own = products.filter((p) => p.isActive && p.catalogId === catalog._id);
      return { catalog, image: catalog.imageUrl || undefined, productCount: own.length };
    })
    .filter((entry) => entry.productCount > 0);
}

const VARIANTS = ["fresh-today", "indian-grocery", "green", "cream", "terracotta", "peach"] as const;
const LABELS = ["FEATURED CATALOG", "EXPLORE RANGE"];

/** Keeps the banner colours and small labels varied but stable for each position. */
export function showcaseStyle(index: number) {
  return { variant: VARIANTS[index % VARIANTS.length], label: LABELS[index % LABELS.length] };
}

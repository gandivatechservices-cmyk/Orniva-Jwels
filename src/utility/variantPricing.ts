import type { Product } from "utility/services";

/** How many units left count as "low stock" in the UI. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Card props that depend on a product's variants. Single-variant products keep their base price;
 * multi-variant products show the lowest variant price ("From £x") and total stock.
 */
export function variantCardProps(product: Product): {
  price: number;
  stock: number;
  priceFrom: boolean;
  selectOptions: boolean;
} {
  const variants = product.variants || [];
  if (variants.length <= 1) {
    return { price: product.basePrice, stock: variants[0]?.stock ?? 10, priceFrom: false, selectOptions: false };
  }
  const prices = variants.map((v) => v.price);
  const lowest = Math.min(...prices);
  return {
    price: lowest,
    stock: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
    priceFrom: Math.max(...prices) > lowest,
    selectOptions: true,
  };
}

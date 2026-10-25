import type { Variant } from "utility/services";

/**
 * Makes option labels unique across a product's variants. When two variants would show the
 * same label (e.g. both "100"), the other attributes are appended, then the SKU as a last resort.
 */
/** Shows a numeric `unit` attribute as "Pack of N" (e.g. 2 → "Pack of 2"); other values are left as-is. */
export function formatUnit(value: string | number): string {
  const text = String(value).trim();
  return /^\d+$/.test(text) ? `Pack of ${text}` : text;
}

export function uniqueVariantLabels(variants: Variant[], baseLabel: (variant: Variant, index: number) => string): string[] {
  const base = variants.map(baseLabel);
  const counts = new Map<string, number>();
  base.forEach((label) => counts.set(label, (counts.get(label) || 0) + 1));

  const withAttributes = base.map((label, index) => {
    if ((counts.get(label) || 0) < 2) return label;
    const extra = Object.entries(variants[index].attributes || {})
      .filter(([key, value]) => value && !label.includes(key === "unit" ? formatUnit(value) : String(value)))
      .map(([key, value]) => (key === "unit" ? formatUnit(value) : `${key} ${value}`));
    return extra.length ? `${label} · ${extra.join(" · ")}` : label;
  });

  // Still identical (same attributes) — tell them apart by name, then SKU.
  const finalCounts = new Map<string, number>();
  withAttributes.forEach((label) => finalCounts.set(label, (finalCounts.get(label) || 0) + 1));
  return withAttributes.map((label, index) => {
    if ((finalCounts.get(label) || 0) < 2) return label;
    const tag = variants[index].name?.trim() || variants[index].sku;
    return tag ? `${label} · ${tag}` : label;
  });
}

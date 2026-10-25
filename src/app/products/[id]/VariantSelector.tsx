"use client";

import type { Variant } from "utility/services";
import { formatUnit } from "utility/variantLabels";
import styles from "./product.module.css";

/** A variant's value for an attribute; "" when it doesn't have that attribute at all. */
const valueOf = (variant: Variant, key: string): string => variant.attributes?.[key]?.trim() ?? "";

/** Attributes whose value differs between variants (a missing value counts as its own choice). */
export function getVaryingKeys(variants: Variant[]): string[] {
  const keys = Array.from(new Set(variants.flatMap((v) => Object.keys(v.attributes || {}))));
  return keys.filter((key) => new Set(variants.map((v) => valueOf(v, key))).size > 1);
}

/**
 * Rows work when each combination of values leads to exactly one variant — otherwise some
 * variants could never be picked. Variants may leave an attribute blank (see blankLabel).
 */
export function canGroupVariants(variants: Variant[]): boolean {
  const keys = getVaryingKeys(variants);
  if (keys.length === 0) return false;
  const combos = variants.map((v) => keys.map((key) => valueOf(v, key)).join("\u0000"));
  return new Set(combos).size === variants.length;
}

const keyTitle = (key: string) => (key === "unit" ? "Pack" : key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase()));
/** What a blank value reads as, chosen to suit the attribute ("Weight: Standard", "Flavour: Plain"). */
const blankLabel = (key: string): string => {
  if (/weight|volume|size|capacity|length|width|height/i.test(key)) return "Standard";
  if (/flavou?r|taste|scent|fragrance/i.test(key)) return "Plain";
  if (key === "unit" || /pack|count|quantity/i.test(key)) return "Single";
  return "Default";
};
const valueLabel = (key: string, value: string) => (value === "" ? blankLabel(key) : key === "unit" ? formatUnit(value) : value);
const isColorKey = (key: string) => /colou?r/i.test(key);
/** A CSS colour we can paint as a swatch (e.g. "red", "#c00"); anything else falls back to a text button. */
const swatchColor = (key: string, value: string): string | null =>
  value && isColorKey(key) && typeof CSS !== "undefined" && CSS.supports("color", value) ? value : null;

type Props = {
  variants: Variant[];
  selected: Variant | null;
  onSelect: (variant: Variant) => void;
  /** Formats a price for display; when given, each option shows the price it would switch to. */
  formatPrice?: (price: number) => string;
};

/** One row of choices per varying attribute (like Amazon / Flipkart). Picking a value jumps to the closest in-stock variant. */
export function VariantSelector({ variants, selected, onSelect, formatPrice }: Props) {
  const keys = getVaryingKeys(variants);
  const current = (key: string) => (selected ? valueOf(selected, key) : "");

  // The variant an option leads to: in stock first, then the one agreeing with the most other current choices.
  const bestFor = (key: string, value: string) => {
    const score = (v: Variant) => keys.filter((k) => k !== key && valueOf(v, k) === current(k)).length;
    return variants
      .filter((v) => valueOf(v, key) === value)
      .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || score(b) - score(a))[0];
  };

  const pick = (key: string, value: string) => {
    const best = bestFor(key, value);
    if (best) onSelect(best);
  };

  return (
    <div className={styles.variantGroups}>
      {keys.map((key) => {
        const values = Array.from(new Set(variants.map((v) => valueOf(v, key))));
        return (
          <div key={key} className={styles.variantGroup}>
            <span className={styles.variantGroupTitle}>
              {keyTitle(key)}: <strong>{selected ? valueLabel(key, current(key)) : ""}</strong>
            </span>
            <div className={styles.variantOptions} role="radiogroup" aria-label={keyTitle(key)}>
              {values.map((value) => {
                const withValue = variants.filter((v) => valueOf(v, key) === value);
                const anyInStock = withValue.some((v) => v.stock > 0);
                // Is this exact combination (with the other current choices) available?
                const comboInStock = withValue.some(
                  (v) => v.stock > 0 && keys.every((k) => k === key || valueOf(v, k) === current(k))
                );
                const isSelected = current(key) === value;
                const target = bestFor(key, value);
                const color = swatchColor(key, value);
                return (
                  <button
                    key={value || "__blank"}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!anyInStock}
                    title={!anyInStock ? "Out of stock" : !comboInStock ? "Not available with your other choices" : undefined}
                    className={`${styles.variantPill} ${isSelected ? styles.active : ""} ${!anyInStock ? styles.outOfStock : ""} ${anyInStock && !comboInStock ? styles.variantUnavailable : ""}`}
                    onClick={() => pick(key, value)}
                  >
                    {color ? (
                      <span className={styles.variantSwatch} style={{ background: color }} aria-label={value} />
                    ) : (
                      <span>{valueLabel(key, value)}</span>
                    )}
                    {formatPrice && target && anyInStock && <span className={styles.variantPillPrice}>{formatPrice(target.price)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

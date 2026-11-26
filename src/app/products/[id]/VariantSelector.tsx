"use client";

import type { CSSProperties } from "react";
import type { Variant } from "utility/services";
import { formatUnit } from "utility/variantLabels";
import { SizeSelector } from "components/common/SizeSelector";
import { isGuideKey, type SizeGuide } from "constants/sizeGuides";
import { getOptionVisual, type OptionVisual } from "./variantVisuals";
import styles from "./VariantSelector.module.css";

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
  /** Products with a size guide (rings, necklaces...) show their size attribute as a dropdown with a help modal. */
  sizeGuide?: SizeGuide | null;
};

/** One row of choices per varying attribute (like Amazon / Flipkart). Picking a value jumps to the closest in-stock variant. */
export function VariantSelector({ variants, selected, onSelect, sizeGuide = null }: Props) {
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
    <div className={styles.groups}>
      {keys.map((key) => {
        const values = Array.from(new Set(variants.map((v) => valueOf(v, key))));

        if (sizeGuide && isGuideKey(sizeGuide, key)) {
          return (
            <div key={key} className={styles.group}>
              <SizeSelector
                guide={sizeGuide}
                value={selected ? current(key) : ""}
                onChange={(value) => pick(key, value)}
                options={values.map((value) => {
                  const withValue = variants.filter((v) => valueOf(v, key) === value);
                  const anyInStock = withValue.some((v) => v.stock > 0);
                  const comboInStock = withValue.some(
                    (v) => v.stock > 0 && keys.every((k) => k === key || valueOf(v, k) === current(k))
                  );
                  return {
                    value,
                    label: valueLabel(key, value),
                    disabled: !anyInStock,
                    unavailable: anyInStock && !comboInStock,
                  };
                })}
              />
            </div>
          );
        }

        return (
          <div key={key} className={styles.group}>
            <span className={styles.groupTitle}>
              {keyTitle(key)}: <strong>{selected ? valueLabel(key, current(key)) : ""}</strong>
            </span>
            <div className={styles.options} role="radiogroup" aria-label={keyTitle(key)}>
              {values.map((value, index) => {
                const withValue = variants.filter((v) => valueOf(v, key) === value);
                const anyInStock = withValue.some((v) => v.stock > 0);
                // Is this exact combination (with the other current choices) available?
                const comboInStock = withValue.some(
                  (v) => v.stock > 0 && keys.every((k) => k === key || valueOf(v, k) === current(k))
                );
                const isSelected = current(key) === value;
                const label = valueLabel(key, value);
                const color = swatchColor(key, value);
                const visual: OptionVisual = color ? { kind: "swatch", background: color } : getOptionVisual(key, value);
                const caption = visual.kind === "shape" || (visual.kind === "swatch" && !visual.text) ? label : null;
                return (
                  <button
                    key={value || "__blank"}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={label}
                    disabled={!anyInStock}
                    title={!anyInStock ? "Out of stock" : !comboInStock ? "Not available with your other choices" : label}
                    style={{ "--i": index } as CSSProperties}
                    className={[
                      styles.opt,
                      isSelected ? styles.active : "",
                      visual.kind === "text" ? styles.textOnly : "",
                      !anyInStock ? styles.outOfStock : "",
                      anyInStock && !comboInStock ? styles.unavailable : "",
                    ].join(" ")}
                    onClick={() => pick(key, value)}
                  >
                    {visual.kind === "swatch" ? (
                      <span
                        className={`${styles.visual} ${styles.swatch} ${visual.dark ? styles.swatchDark : ""}`}
                        style={{ background: visual.background }}
                      >
                        {visual.text}
                      </span>
                    ) : visual.kind === "shape" ? (
                      <span className={styles.visual}>{visual.icon}</span>
                    ) : (
                      <span className={`${styles.visual} ${styles.textChip}`}>{label}</span>
                    )}
                    {caption && <span className={styles.caption}>{caption}</span>}
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

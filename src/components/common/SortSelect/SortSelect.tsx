"use client";

import { Select } from "../../ui/Select";
import { SortIcon } from "../../icons";
import type { SortOption, SortSelectProps } from "./types";
import styles from "./SortSelect.module.css";

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Alphabetical (A-Z)", value: "name-asc" },
  { label: "Newest Arrivals", value: "newest" },
];

export function SortSelect({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  className = "",
}: SortSelectProps) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <SortIcon size={16} style={{ color: "var(--color-muted)" }} />
      <span className={styles.label}>Sort by:</span>
      <div className={styles.selectWrapper}>
        <Select
          value={value}
          onChange={onChange}
          options={options}
          size="sm"
        />
      </div>
    </div>
  );
}

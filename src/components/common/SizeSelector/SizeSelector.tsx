"use client";

import { useState } from "react";
import { ChevronDownIcon } from "components/icons";
import type { SizeGuide } from "constants/sizeGuides";
import { SizeHelpModal } from "../SizeHelpModal/SizeHelpModal";
import styles from "./SizeSelector.module.css";

export type SizeOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** In stock, but not with the other current choices. */
  unavailable?: boolean;
};

export type SizeSelectorProps = {
  guide: SizeGuide;
  options: SizeOption[];
  /** Currently selected value, "" when nothing is selected. */
  value: string;
  onChange: (value: string) => void;
};

/** Size / length dropdown with a help link that opens the guide's help modal (ring size, necklace length...). */
export function SizeSelector({ guide, options, value, onChange }: SizeSelectorProps) {
  const { title, placeholder, helpLink, outOfStock } = guide.selector;
  const [helpOpen, setHelpOpen] = useState(false);
  const hasValue = options.some((o) => o.value === value);

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <label htmlFor={`size-select-${guide.id}`} className={styles.title}>
          {title}
        </label>
        <button type="button" className={styles.helpLink} onClick={() => setHelpOpen(true)}>
          {helpLink}
        </button>
      </div>

      <div className={styles.selectWrap}>
        <select
          id={`size-select-${guide.id}`}
          className={styles.select}
          value={hasValue ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {!hasValue && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value || "__blank"} value={o.value} disabled={o.disabled}>
              {o.label}
              {o.disabled ? ` – ${outOfStock}` : ""}
            </option>
          ))}
        </select>
        <ChevronDownIcon size={16} className={styles.chevron} />
      </div>

      <SizeHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} guide={guide} />
    </div>
  );
}

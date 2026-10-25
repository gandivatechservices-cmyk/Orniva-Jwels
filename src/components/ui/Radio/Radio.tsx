import { forwardRef } from "react";
import type { RadioProps } from "./types";
import styles from "./Radio.module.css";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, helperText, disabled, className = "", id, ...props },
  ref
) {
  const radioId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={radioId} className={`${styles.labelWrapper} ${disabled ? styles.disabled : ""}`}>
        <div className={styles.radioBox}>
          <input
            ref={ref}
            id={radioId}
            type="radio"
            disabled={disabled}
            className={styles.nativeInput}
            {...props}
          />
          <span className={styles.customRadio}>
            <span className={styles.radioDot} />
          </span>
        </div>
        {label && <span className={styles.labelText}>{label}</span>}
      </label>
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
});

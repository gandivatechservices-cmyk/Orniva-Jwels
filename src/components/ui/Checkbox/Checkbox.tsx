import { forwardRef } from "react";
import { CheckIcon } from "components/icons";
import type { CheckboxProps } from "./types";
import styles from "./Checkbox.module.css";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, helperText, error, disabled, className = "", id, ...props },
  ref
) {
  const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={checkboxId} className={`${styles.labelWrapper} ${disabled ? styles.disabled : ""}`}>
        <div className={styles.checkboxBox}>
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className={styles.nativeInput}
            {...props}
          />
          <span className={styles.customCheck}>
            <CheckIcon size={12} className={styles.checkIcon} />
          </span>
        </div>
        {label && <span className={styles.labelText}>{label}</span>}
      </label>
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

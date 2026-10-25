import { forwardRef } from "react";
import type { SwitchProps } from "./types";
import styles from "./Switch.module.css";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, helperText, disabled, className = "", id, ...props },
  ref
) {
  const switchId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={switchId} className={`${styles.labelWrapper} ${disabled ? styles.disabled : ""}`}>
        <div className={styles.switchBox}>
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className={styles.nativeInput}
            {...props}
          />
          <span className={styles.track}>
            <span className={styles.thumb} />
          </span>
        </div>
        {label && <span className={styles.labelText}>{label}</span>}
      </label>
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
});

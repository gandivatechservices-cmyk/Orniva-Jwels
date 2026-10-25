import { forwardRef } from "react";
import type { InputProps } from "./types";
import styles from "./Input.module.css";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    inputSize = "md",
    prefixIcon,
    suffixIcon,
    fullWidth = true,
    disabled,
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={`
          ${styles.inputWrapper}
          ${styles[inputSize]}
          ${error ? styles.hasError : ""}
          ${disabled ? styles.disabled : ""}
        `}
      >
        {prefixIcon && <span className={styles.prefix}>{prefixIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={styles.input}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {suffixIcon && <span className={styles.suffix}>{suffixIcon}</span>}
      </div>
      {error && (
        <span id={`${inputId}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
});

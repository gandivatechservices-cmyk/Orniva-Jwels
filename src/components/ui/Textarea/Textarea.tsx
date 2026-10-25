import { forwardRef } from "react";
import type { TextareaProps } from "./types";
import styles from "./Textarea.module.css";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, fullWidth = true, disabled, className = "", id, ...props },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        className={`
          ${styles.textarea}
          ${error ? styles.hasError : ""}
          ${disabled ? styles.disabled : ""}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${textareaId}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${textareaId}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
});

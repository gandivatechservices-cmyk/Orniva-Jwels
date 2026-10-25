import { Spinner } from "components/ui/Spinner";
import type { ButtonProps } from "./types";
import styles from "./Button.module.css";

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  pill = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      disabled={isButtonDisabled}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ""}
        ${pill ? styles.pill : ""}
        ${isLoading ? styles.loading : ""}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinnerWrap}>
          <Spinner size="sm" variant={variant === "primary" || variant === "danger" ? "white" : "primary"} />
        </span>
      )}
      {!isLoading && leftIcon && <span className={styles.iconSlot}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.iconSlot}>{rightIcon}</span>}
    </button>
  );
}

import type { IconButtonProps } from "./types";
import styles from "./IconButton.module.css";

export function IconButton({
  icon,
  "aria-label": ariaLabel,
  variant = "ghost",
  size = "md",
  shape = "round",
  isLoading = false,
  disabled,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled || isLoading}
      className={`
        ${styles.iconButton}
        ${styles[variant]}
        ${styles[size]}
        ${styles[shape]}
        ${className}
      `}
      {...props}
    >
      <span className={styles.iconSlot}>{icon}</span>
    </button>
  );
}

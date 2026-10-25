import type { SpinnerProps } from "./types";
import styles from "./Spinner.module.css";

export function Spinner({ size = "md", variant = "primary", className = "", ...props }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${styles[variant]} ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}

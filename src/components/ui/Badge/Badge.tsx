import type { BadgeProps } from "./types";
import styles from "./Badge.module.css";

export function Badge({
  variant = "neutral",
  size = "md",
  pill = true,
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        ${styles.badge}
        ${styles[variant]}
        ${styles[size]}
        ${pill ? styles.pill : styles.rounded}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

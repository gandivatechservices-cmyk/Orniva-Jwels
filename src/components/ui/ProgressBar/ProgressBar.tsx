import type { ProgressBarProps } from "./types";
import styles from "./ProgressBar.module.css";

export function ProgressBar({
  value,
  height = 8,
  variant = "accent",
  showLabel = false,
  className = "",
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(0, value), 100);

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: `${height}px` }}
        className={styles.track}
      >
        <div
          style={{ width: `${clampedValue}%` }}
          className={`${styles.fill} ${styles[variant]}`}
        />
      </div>
      {showLabel && <span className={styles.label}>{Math.round(clampedValue)}%</span>}
    </div>
  );
}

import type { SkeletonProps } from "./types";
import styles from "./Skeleton.module.css";

export function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const customStyle = {
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    ...style,
  };

  if (count > 1) {
    return (
      <div className={styles.group}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={customStyle}
            aria-hidden="true"
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...props}
    />
  );
}

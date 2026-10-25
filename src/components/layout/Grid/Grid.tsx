import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Grid.module.css";

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | "auto-fit" | "auto-fill";
export type GridGap = "sm" | "md" | "lg";

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: GridCols;
  gap?: GridGap;
  children: ReactNode;
};

export function Grid({
  cols = 4,
  gap = "md",
  children,
  className = "",
  ...props
}: GridProps) {
  const colClass = typeof cols === "number" ? `cols-${cols}` : cols;

  return (
    <div
      className={`
        ${styles.grid}
        ${styles[colClass]}
        ${styles[`gap-${gap}`]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

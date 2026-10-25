import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Container.module.css";

export type ContainerSize = "default" | "narrow" | "wide" | "full";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
  children: ReactNode;
};

export function Container({ size = "default", children, className = "", ...props }: ContainerProps) {
  return (
    <div className={`${styles.container} ${styles[size]} ${className}`} {...props}>
      {children}
    </div>
  );
}

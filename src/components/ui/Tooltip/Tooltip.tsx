import { useState } from "react";
import type { TooltipProps } from "./types";
import styles from "./Tooltip.module.css";

export function Tooltip({
  content,
  position = "top",
  children,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`${styles.container} ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div role="tooltip" className={`${styles.bubble} ${styles[position]}`}>
          {content}
        </div>
      )}
    </div>
  );
}

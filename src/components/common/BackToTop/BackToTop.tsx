"use client";

import { useState, useEffect, useCallback, type CSSProperties, type ReactNode } from "react";
import { ArrowUpIcon } from "../../icons";
import styles from "./BackToTop.module.css";

export interface BackToTopProps {
  /**
   * Scroll distance in pixels before the button appears.
   * @default 350
   */
  threshold?: number;
  /**
   * Custom scroll behavior when scrolling up.
   * @default "smooth"
   */
  behavior?: ScrollBehavior;
  /**
   * Whether to display the circular scroll percentage progress ring.
   * @default true
   */
  showProgress?: boolean;
  /**
   * Accessible aria-label for assistive screen readers.
   * @default "Scroll back to top"
   */
  ariaLabel?: string;
  /**
   * Optional custom CSS class name.
   */
  className?: string;
  /**
   * Optional inline styles.
   */
  style?: CSSProperties;
  /**
   * Optional custom icon or content replacing the default ArrowUpIcon.
   */
  children?: ReactNode;
}

const CIRCLE_RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function BackToTop({
  threshold = 350,
  behavior = "smooth",
  showProgress = true,
  ariaLabel = "Scroll back to top",
  className = "",
  style,
  children,
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const shouldShow = scrollY > threshold;
    setIsVisible(shouldShow);

    if (showProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    }
  }, [threshold, showProgress]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Run once on mount to capture existing scroll state (e.g. on page refresh)
    checkScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [checkScroll]);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;

    // Honor user preferences for reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : behavior,
    });
  };

  const strokeDashoffset = CIRCUMFERENCE - (scrollProgress / 100) * CIRCUMFERENCE;

  return (
    <button
      type="button"
      className={`${styles.backToTop} ${isVisible ? styles.visible : ""} ${className}`.trim()}
      style={style}
      onClick={scrollToTop}
      aria-label={ariaLabel}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      title={ariaLabel}
    >
      {showProgress && (
        <svg
          className={styles.progressRing}
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <circle
            className={styles.progressTrack}
            cx="24"
            cy="24"
            r={CIRCLE_RADIUS}
          />
          <circle
            className={styles.progressBar}
            cx="24"
            cy="24"
            r={CIRCLE_RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      )}

      <span className={styles.iconWrapper} aria-hidden="true">
        {children ?? <ArrowUpIcon size={18} />}
      </span>
    </button>
  );
}

export default BackToTop;

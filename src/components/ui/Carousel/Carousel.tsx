import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "components/icons";
import type { CarouselProps } from "./types";
import styles from "./Carousel.module.css";

export function Carousel({
  children,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  interval = 5000,
  className = "",
  itemClassName = "",
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = children.length;

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const targetScroll = container.clientWidth * index;
    container.scrollTo({ left: targetScroll, behavior: "smooth" });
    setCurrentIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : total - 1;
    scrollToIndex(nextIdx);
  }, [currentIndex, total, scrollToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = currentIndex < total - 1 ? currentIndex + 1 : 0;
    scrollToIndex(nextIdx);
  }, [currentIndex, total, scrollToIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollLeft;
      const width = container.clientWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollPos / width);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < total) {
          setCurrentIndex(newIndex);
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, total]);

  useEffect(() => {
    if (!autoPlay || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, total, interval, handleNext]);

  if (total === 0) return null;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {showArrows && total > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className={`${styles.arrow} ${styles.prevArrow}`}
        >
          <ChevronLeftIcon size={20} />
        </button>
      )}

      <div ref={containerRef} className={styles.container}>
        {children.map((child, idx) => (
          <div key={idx} className={`${styles.slide} ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {showArrows && total > 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className={`${styles.arrow} ${styles.nextArrow}`}
        >
          <ChevronRightIcon size={20} />
        </button>
      )}

      {showDots && total > 1 && (
        <div className={styles.dots} role="tablist">
          {children.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => scrollToIndex(idx)}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

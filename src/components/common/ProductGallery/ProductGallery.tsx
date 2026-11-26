"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "../../icons";
import { IMAGES } from "../../../constants/images";
import styles from "./ProductGallery.module.css";

export type ProductGalleryProps = {
  images: string[];
  alt: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  /** Called when a slide is tapped / clicked (opens the full screen viewer). */
  onOpen: () => void;
  /** Overlay controls (badge, wishlist, expand) rendered above the slides. */
  children?: ReactNode;
};

/**
 * Swipeable product gallery: native scroll-snap carousel (touch swipe, trackpad,
 * arrows) with dot indicators instead of a thumbnail strip.
 */
export function ProductGallery({ images, alt, selectedIndex, onSelect, onOpen, children }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const count = images.length;
  const imagesKey = images.join("|");

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    programmatic.current = true;
    el.scrollTo({ left: index * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    window.setTimeout(() => {
      programmatic.current = false;
    }, smooth ? 500 : 50);
  }, []);

  // New image set (e.g. variant change): jump back to the selected slide instantly.
  useEffect(() => {
    scrollToIndex(Math.min(selectedIndex, Math.max(0, count - 1)), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey]);

  // Selection changed from outside (dots / arrows / lightbox).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (current !== selectedIndex) scrollToIndex(selectedIndex, true);
  }, [selectedIndex, scrollToIndex]);

  // Keep dots in sync while the user swipes.
  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || programmatic.current) return;
    const index = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (index !== selectedIndex && index >= 0 && index < count) onSelect(index);
  };

  // Keep alignment on resize.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onResize = () => scrollToIndex(selectedIndex, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selectedIndex, scrollToIndex]);

  const go = (delta: number) => onSelect((selectedIndex + delta + count) % count);

  return (
    <div className={styles.gallery}>
      <div className={styles.frame}>
        {children}

        <div
          className={styles.track}
          ref={trackRef}
          onScroll={handleScroll}
          role="group"
          aria-roledescription="carousel"
          aria-label="Product images"
        >
          {images.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className={`${styles.slide} ${idx === selectedIndex ? styles.slideActive : ""}`}
              role="button"
              tabIndex={idx === selectedIndex ? 0 : -1}
              aria-label={`Image ${idx + 1} of ${count}. Click to enlarge`}
              onClick={onOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen();
                } else if (e.key === "ArrowLeft" && count > 1) {
                  go(-1);
                } else if (e.key === "ArrowRight" && count > 1) {
                  go(1);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={idx === selectedIndex ? alt : ""}
                className={styles.image}
                draggable={false}
                loading={idx === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = IMAGES.placeholders.product;
                }}
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ArrowRightIcon size={18} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Choose image">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === selectedIndex}
              aria-label={`Show image ${idx + 1}`}
              className={`${styles.dot} ${idx === selectedIndex ? styles.dotActive : ""}`}
              onClick={() => onSelect(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

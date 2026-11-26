"use client";

import { useEffect, useState, useRef, useCallback, type PointerEvent, type WheelEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "../../icons";
import { IMAGES } from "../../../constants/images";
import type { ProductImageLightboxProps } from "./types";
import styles from "./ProductImageLightbox.module.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;
const SWIPE_THRESHOLD = 60;

const pad = (n: number) => String(n).padStart(2, "0");

export function ProductImageLightbox({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  title,
}: ProductImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<"next" | "prev" | "none">("none");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  // Sync index when the viewer opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setDirection("none");
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setSwipeX(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex, images.length]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(1)));
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleToggleZoom = useCallback(() => {
    if (zoomLevel > 1) resetZoom();
    else setZoomLevel(2);
  }, [zoomLevel, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "+" || e.key === "=") handleZoomIn();
      else if (e.key === "-") handleZoomOut();
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, handlePrev, handleNext, handleZoomIn, handleZoomOut, resetZoom]);

  // Mouse wheel zoom
  const handleWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  // Pointer handling (mouse + touch): swipe between images at 1x, pan when zoomed
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    movedRef.current = false;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = panPosition;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    if (zoomLevel > 1) {
      setPanPosition({ x: panStartRef.current.x + dx, y: panStartRef.current.y + dy });
    } else if (images.length > 1) {
      setSwipeX(dx);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (zoomLevel <= 1) {
      if (swipeX <= -SWIPE_THRESHOLD) handleNext();
      else if (swipeX >= SWIPE_THRESHOLD) handlePrev();
      setSwipeX(0);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || IMAGES.placeholders.product;
  const animClass =
    direction === "next" ? styles.enterFromRight : direction === "prev" ? styles.enterFromLeft : styles.enterFade;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title ? `${title} images` : "Image preview"}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close image preview" title="Close (Esc)">
        Close
      </button>

      {images.length > 1 && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={handlePrev}
          aria-label="Previous image"
          title="Previous (Left arrow)"
        >
          <ArrowLeftIcon size={20} />
        </button>
      )}

      <div
        className={styles.stage}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (e.target === e.currentTarget && !movedRef.current) onClose();
        }}
        style={{ cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
      >
        {/* Outer layer follows the finger while swiping; inner layer plays the enter animation */}
        <div
          className={styles.swipeLayer}
          style={{
            transform: `translate3d(${swipeX}px, 0, 0)`,
            transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div key={`${currentIndex}-${currentImg}`} className={`${styles.slide} ${animClass}`}>
            <div
              className={styles.imageWrapper}
              style={{
                transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomLevel})`,
                transition: isDragging ? "none" : "transform 0.25s ease-out",
              }}
              onDoubleClick={handleToggleZoom}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImg}
                alt={title || "Product image preview"}
                className={styles.image}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = IMAGES.placeholders.product;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={handleNext}
          aria-label="Next image"
          title="Next (Right arrow)"
        >
          <ArrowRightIcon size={20} />
        </button>
      )}

      {images.length > 1 && (
        <div className={styles.counter} aria-live="polite">
          {pad(currentIndex + 1)} / {pad(images.length)}
        </div>
      )}
    </div>
  );
}

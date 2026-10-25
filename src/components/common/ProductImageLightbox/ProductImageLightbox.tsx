"use client";

import { useEffect, useState, useRef, useCallback, type MouseEvent, type TouchEvent, type WheelEvent } from "react";
import {
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetZoomIcon,
} from "../../icons";
import { IMAGES } from "../../../constants/images";
import type { ProductImageLightboxProps } from "./types";
import styles from "./ProductImageLightbox.module.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export function ProductImageLightbox({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  title,
}: ProductImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Sync index when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
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
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
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
    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomLevel(2);
    }
  }, [zoomLevel, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext, handleZoomIn, handleZoomOut, resetZoom]);

  // Mouse wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag to pan when zoomed
  const handleMouseDown = (e: MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch controls for mobile (swipe to navigate or drag to pan)
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      if (zoomLevel > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - panPosition.x,
          y: e.touches[0].clientY - panPosition.y,
        };
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (zoomLevel > 1 && isDragging && e.touches.length === 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(false);
      return;
    }
    // Handle swipe when at 1x zoom
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || IMAGES.placeholders.product;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Controls */}
      <div className={styles.topBar}>
        <div className={styles.titleInfo}>
          {title && <h3 className={styles.productTitle}>{title}</h3>}
          {images.length > 1 && (
            <span className={styles.counterBadge}>
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        <div className={styles.controlsGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleZoomOut}
            disabled={zoomLevel <= MIN_ZOOM}
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOutIcon size={18} />
          </button>

          <span className={styles.zoomBadge}>{Math.round(zoomLevel * 100)}%</span>

          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleZoomIn}
            disabled={zoomLevel >= MAX_ZOOM}
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomInIcon size={18} />
          </button>

          {zoomLevel > 1 && (
            <button
              type="button"
              className={styles.toolBtn}
              onClick={resetZoom}
              title="Reset zoom (0)"
              aria-label="Reset zoom"
            >
              <ResetZoomIcon size={18} />
            </button>
          )}

          <button
            type="button"
            className={`${styles.toolBtn} ${styles.closeBtn}`}
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close image preview"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className={styles.stage}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            aria-label="Previous image"
            title="Previous (Left arrow)"
          >
            <ArrowLeftIcon size={22} />
          </button>
        )}

        {/* Viewport Area */}
        <div
          className={styles.viewportArea}
          onMouseDown={handleMouseDown}
          style={{
            cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          onClick={(e) => {
            // Click on empty stage closes lightbox if not dragging
            if (e.target === e.currentTarget && !isDragging) {
              onClose();
            }
          }}
        >
          <div
            className={styles.imageWrapper}
            style={{
              transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0) scale(${zoomLevel})`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
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

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next image"
            title="Next (Right arrow)"
          >
            <ArrowRightIcon size={22} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className={styles.bottomBar}>
          <div className={styles.thumbnailsList}>
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.thumbBtn} ${idx === currentIndex ? styles.active : ""}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  resetZoom();
                }}
                aria-label={`View image ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  className={styles.thumbImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = IMAGES.placeholders.product;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

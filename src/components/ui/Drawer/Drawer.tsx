"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "components/icons";
import { IconButton } from "components/ui/IconButton";
import { useScrollLock } from "hooks";
import type { DrawerProps } from "./types";
import styles from "./Drawer.module.css";

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  placement = "right",
  closeOnBackdrop = true,
  closeOnEsc = true,
  width,
  className = "",
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      drawerRef.current?.focus();
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const customStyle = width ? { maxWidth: typeof width === "number" ? `${width}px` : width } : undefined;

  const drawerElement = (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        tabIndex={-1}
        style={customStyle}
        className={`
          ${styles.drawer}
          ${styles[placement]}
          ${className}
        `}
      >
        <div className={styles.header}>
          {title && (
            <div id="drawer-title" className={styles.title}>
              {title}
            </div>
          )}
          <IconButton
            icon={<CloseIcon size={20} />}
            aria-label="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={styles.closeBtn}
          />
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(drawerElement, document.body);
}

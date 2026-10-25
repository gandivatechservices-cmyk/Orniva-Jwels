"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseIcon, TruckIcon } from "components/icons";
import styles from "./TopAnnouncementBar.module.css";

export type TopAnnouncementBarProps = {
  message?: string;
  dismissible?: boolean;
};

export function TopAnnouncementBar({
  message = "Free Delivery on Orders Over £40 | UK Wide",
  dismissible = false,
}: TopAnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <div className={styles.inner}>
        {/* CENTER DELIVERY MESSAGE */}
        <div className={styles.content}>
          <TruckIcon size={15} className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>{message}</span>
        </div>

        {/* RIGHT QUICK LINKS */}
        <div className={styles.quickLinks}>
          <Link href="/products" prefetch={false} className={styles.quickLink}>Help</Link>
          <span className={styles.divider}>|</span>
          <Link href="/orders" prefetch={false} className={styles.quickLink}>Track Order</Link>
          <span className={styles.divider}>|</span>
          <Link href="/admin/dashboard" prefetch={false} className={styles.quickLink}>Sell with us</Link>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className={styles.closeBtn}
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

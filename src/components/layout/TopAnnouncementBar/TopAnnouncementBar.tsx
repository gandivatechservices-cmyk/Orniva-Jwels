"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseIcon, TruckIcon, RefreshCwIcon, ShieldCheckIcon, LockIcon } from "components/icons";
import styles from "./TopAnnouncementBar.module.css";

export type TopAnnouncementBarProps = {
  message?: string;
  dismissible?: boolean;
};

export function TopAnnouncementBar({
  dismissible = false,
}: TopAnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={styles.bar} role="region" aria-label="Store Trust Highlights">
      <div className={styles.inner}>
        {/* CENTER LUXURY TRUST MESSAGES */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <TruckIcon size={14} className={styles.goldIcon} aria-hidden="true" />
            <span className={styles.text}>Free Shipping</span>
          </div>
          <span className={styles.dot}>•</span>
          <div className={styles.trustItem}>
            <RefreshCwIcon size={13} className={styles.goldIcon} aria-hidden="true" />
            <span className={styles.text}>30 Days Easy Return</span>
          </div>
          <span className={styles.dot}>•</span>
          <div className={styles.trustItem}>
            <ShieldCheckIcon size={14} className={styles.goldIcon} aria-hidden="true" />
            <span className={styles.text}>Certified Jewellery</span>
          </div>
          <span className={styles.dot}>•</span>
          <div className={styles.trustItem}>
            <LockIcon size={13} className={styles.goldIcon} aria-hidden="true" />
            <span className={styles.text}>Secure Payments</span>
          </div>
        </div>

        {/* RIGHT QUICK LINKS */}
        <div className={styles.quickLinks}>
          <Link href="/orders" prefetch={false} className={styles.quickLink}>Track Order</Link>
          <span className={styles.divider}>|</span>
          <Link href="/contact" prefetch={false} className={styles.quickLink}>Contact</Link>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseIcon, TruckIcon, RefreshCwIcon, ShieldCheckIcon, LockIcon } from "components/icons";
import styles from "./TopAnnouncementBar.module.css";

export type TopAnnouncementBarProps = {
  message?: string;
  dismissible?: boolean;
};

const TRUST_ITEMS = [
  { icon: TruckIcon, iconSize: 14, text: "Free Shipping" },
  { icon: RefreshCwIcon, iconSize: 13, text: "30 Days Easy Return" },
  { icon: ShieldCheckIcon, iconSize: 14, text: "Certified Jewellery" },
  { icon: LockIcon, iconSize: 13, text: "Secure Payments" },
];

export function TopAnnouncementBar({
  dismissible = false,
}: TopAnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const renderTrustItems = (keyPrefix: string) => (
    <>
      {TRUST_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        return (
          <span key={`${keyPrefix}-${item.text}-${idx}`} className={styles.itemWrapper}>
            <span className={styles.trustItem}>
              <Icon size={item.iconSize} className={styles.goldIcon} aria-hidden="true" />
              <span className={styles.text}>{item.text}</span>
            </span>
            <span className={styles.dot} aria-hidden="true">•</span>
          </span>
        );
      })}
    </>
  );

  return (
    <div className={styles.bar} role="region" aria-label="Store Trust Highlights">
      <div className={styles.inner}>
        {/* DESKTOP STATIC CENTER ROW */}
        <div className={styles.desktopTrustRow}>
          {renderTrustItems("desktop")}
        </div>

        {/* MOBILE / RESPONSIVE SINGLE LINE LIVE TICKER MARQUEE */}
        <div className={styles.mobileMarquee} aria-label="Store Trust Highlights">
          <div className={styles.marqueeTrack}>
            {renderTrustItems("track1-a")}
            {renderTrustItems("track1-b")}
          </div>
          <div className={styles.marqueeTrack} aria-hidden="true">
            {renderTrustItems("track2-a")}
            {renderTrustItems("track2-b")}
          </div>
        </div>

        {/* RIGHT QUICK LINKS (DESKTOP) */}
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

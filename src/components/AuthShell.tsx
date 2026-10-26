import type { ReactNode } from "react";
import styles from "./AuthShell.module.css";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.shell}>
      {/* LEFT: Authentication Content Area */}
      <section className={styles.contentSection}>
        <div className={styles.contentWrapper}>{children}</div>
      </section>

      {/* RIGHT: Fine Jewelry Visual Panel */}
      <section className={styles.visualSection} aria-hidden="true">
        <div className={styles.visualCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/jewelry/hero-model.jpg"
            alt="LUXE JWELS Fine Jewellery"
            className={styles.visualImage}
          />
          <div className={styles.visualOverlay} />
          <div className={styles.visualBadge}>
            <span className={styles.badgePulse} />
            <span className={styles.badgeText}>Certified Fine Jewellery & Timeless Elegance</span>
          </div>
        </div>
      </section>
    </main>
  );
}
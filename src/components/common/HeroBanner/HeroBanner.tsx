"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { IMAGES } from "constants/images";
import styles from "./HeroBanner.module.css";

export type HeroBannerProps = {
  eyebrowText?: string;
  title?: ReactNode;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function HeroBanner({
  eyebrowText,
  title,
  subtitle = "Premium jewellery for every moment. Tradition. Craftsmanship. Forever.",
  primaryCtaText = "Shop Now",
  primaryCtaHref = "/products",
  secondaryCtaText = "Watch Video",
  secondaryCtaHref = "/manufacturing",
  imageSrc = IMAGES.jewelry.heroModel,
  imageAlt = "Model wearing luxury diamond necklace and earrings",
  className = "",
}: HeroBannerProps) {
  return (
    <section className={`${styles.heroSection} ${className}`} aria-label="Luxury Jewelry Hero">
      {/* FULL-BLEED BACKGROUND IMAGE */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt={imageAlt} className={styles.heroImage} loading="eager" />
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.heroContent}>
          {eyebrowText && <span className={styles.eyebrow}>{eyebrowText}</span>}

          <h1 className={styles.heroTitle}>
            {title || (
              <>
                <span>Timeless Elegance,</span>
                <span>Crafted for You</span>
              </>
            )}
          </h1>

          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}

          <div className={styles.heroActions}>
            {primaryCtaText && primaryCtaHref && (
              <Link href={primaryCtaHref} prefetch={false} className={styles.primaryBtn}>
                {primaryCtaText}
              </Link>
            )}

            {secondaryCtaText && secondaryCtaHref && (
              <Link href={secondaryCtaHref} prefetch={false} className={styles.secondaryBtn}>
                <span className={styles.playCircle} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="7 4 20 12 7 20 7 4" />
                  </svg>
                </span>
                <span>{secondaryCtaText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

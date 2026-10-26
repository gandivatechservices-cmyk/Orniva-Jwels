"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { DiamondIcon, ArrowRightIcon } from "components/icons";
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
  eyebrowText = "FINE JEWELLERY • HANDCRAFTED EXCELLENCE",
  title,
  subtitle = "Discover exquisite jewelry designed to celebrate every moment. Where exceptional craftsmanship meets enduring beauty.",
  primaryCtaText = "Shop Now",
  primaryCtaHref = "/products",
  secondaryCtaText = "Discover Our Craftsmanship",
  secondaryCtaHref = "/manufacturing",
  imageSrc = IMAGES.jewelry.heroModel,
  imageAlt = "High fashion model wearing luxury emerald and diamond necklace and earrings",
  className = "",
}: HeroBannerProps) {
  return (
    <section className={`${styles.heroSection} ${className}`} aria-label="Luxury Jewelry Hero">
      <div className={styles.container}>
        {/* LEFT COLUMN: BRAND ACCENT, HEADLINE, SUBTITLE, CTAS */}
        <div className={styles.heroContent}>
          {eyebrowText && (
            <div className={styles.eyebrow}>
              <DiamondIcon size={14} className={styles.eyebrowIcon} aria-hidden="true" />
              <span className={styles.eyebrowText}>{eyebrowText}</span>
            </div>
          )}

          <h1 className={styles.heroTitle}>
            {title || (
              <>
                <span className={styles.headlineLight}>Timeless Elegance,</span>
                <span className={styles.headlineGold}>Crafted for You</span>
              </>
            )}
          </h1>

          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}

          <div className={styles.heroActions}>
            {primaryCtaText && primaryCtaHref && (
              <Link href={primaryCtaHref} prefetch={false} className={styles.ctaLink}>
                <button type="button" className={styles.primaryBtn}>
                  <span>{primaryCtaText}</span>
                  <ArrowRightIcon size={14} className={styles.btnArrow} aria-hidden="true" />
                </button>
              </Link>
            )}

            {secondaryCtaText && secondaryCtaHref && (
              <Link href={secondaryCtaHref} prefetch={false} className={styles.ctaLink}>
                <button type="button" className={styles.secondaryBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>{secondaryCtaText}</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HERO MODEL IMAGE */}
        <div className={styles.heroVisual}>
          <div className={styles.imageGlow} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className={styles.heroImage}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LeafIcon, CartIcon, TruckIcon, PriceTagIcon, ShieldCheckIcon, ArrowRightIcon } from "components/icons";
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
  eyebrowText = "AUTHENTIC & DELICIOUS. EVERY DAY.",
  title,
  subtitle = "Your everyday groceries, authentic Indian namkeen, ready-to-eat meals, and household essentials — all in one place.",
  primaryCtaText = "Shop Groceries",
  primaryCtaHref = "/products",
  secondaryCtaText = "View Offers",
  secondaryCtaHref = "/products?offers=true",
  imageSrc = IMAGES.hero.packagedFood,
  imageAlt = "Bag filled with Indian namkeen, ready-to-eat meals and packaged foods",
  className = "",
}: HeroBannerProps) {
  return (
    <section className={`${styles.heroSection} ${className}`} aria-label="Grocery Hero Banner">
      <div className={styles.container}>
        {/* LEFT COLUMN: EYEBROW, HEADLINE, SUBTITLE, CTAS, TRUST BADGES */}
        <div className={styles.heroContent}>
          {eyebrowText && (
            <div className={styles.eyebrow}>
              <LeafIcon size={16} className={styles.eyebrowIcon} aria-hidden="true" />
              <span className={styles.eyebrowText}>{eyebrowText}</span>
            </div>
          )}

          <h1 className={styles.heroTitle}>
            {title || (
              <>
                <span className={styles.headlineDark}>Good Food.</span>
                <span className={styles.headlineDark}>Good Prices.</span>
                <span className={styles.headlineGreen}>Delivered.</span>
              </>
            )}
          </h1>

          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}

          <div className={styles.heroActions}>
            {primaryCtaText && primaryCtaHref && (
              <Link href={primaryCtaHref} prefetch={false} className={styles.ctaLink}>
                <button type="button" className={styles.primaryBtn}>
                  <CartIcon size={19} className={styles.btnCartIcon} aria-hidden="true" />
                  <span>{primaryCtaText}</span>
                  <ArrowRightIcon size={16} className={styles.btnArrow} aria-hidden="true" />
                </button>
              </Link>
            )}

            {secondaryCtaText && secondaryCtaHref && (
              <Link href={secondaryCtaHref} prefetch={false} className={styles.ctaLink}>
                <button type="button" className={styles.secondaryBtn}>
                  {secondaryCtaText}
                </button>
              </Link>
            )}
          </div>

          {/* 4 VALUE & TRUST BADGES ROW */}
          <div className={styles.trustBadgesRow} role="list" aria-label="Store Benefits">
            <div className={styles.trustBadge} role="listitem">
              <div className={styles.trustIconCircle}>
                <TruckIcon size={18} />
              </div>
              <div className={styles.trustBadgeText}>
                <span className={styles.trustBadgeTitle}>Free delivery</span>
                <span className={styles.trustBadgeSub}>over £40</span>
              </div>
            </div>

            <div className={styles.trustDivider} aria-hidden="true" />

            <div className={styles.trustBadge} role="listitem">
              <div className={styles.trustIconCircle}>
                <LeafIcon size={18} />
              </div>
              <div className={styles.trustBadgeText}>
                <span className={styles.trustBadgeTitle}>Fresh &</span>
                <span className={styles.trustBadgeSub}>quality products</span>
              </div>
            </div>

            <div className={styles.trustDivider} aria-hidden="true" />

            <div className={styles.trustBadge} role="listitem">
              <div className={styles.trustIconCircle}>
                <PriceTagIcon size={18} />
              </div>
              <div className={styles.trustBadgeText}>
                <span className={styles.trustBadgeTitle}>Best</span>
                <span className={styles.trustBadgeSub}>prices always</span>
              </div>
            </div>

            <div className={styles.trustDivider} aria-hidden="true" />

            <div className={styles.trustBadge} role="listitem">
              <div className={styles.trustIconCircle}>
                <ShieldCheckIcon size={18} />
              </div>
              <div className={styles.trustBadgeText}>
                <span className={styles.trustBadgeTitle}>Safe & secure</span>
                <span className={styles.trustBadgeSub}>shopping</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCE HARVEST IMAGE */}
        <div className={styles.heroImageWrapper}>
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

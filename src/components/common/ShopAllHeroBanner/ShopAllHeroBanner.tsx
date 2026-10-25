"use client";

import Link from "next/link";
import { LeafIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon } from "../../icons";
import { IMAGES } from "../../../constants/images";
import styles from "./ShopAllHeroBanner.module.css";

export interface ShopAllHeroBannerProps {
  className?: string;
}

export function ShopAllHeroBanner({ className = "" }: ShopAllHeroBannerProps) {
  return (
    <section className={`${styles.bannerCard} ${className}`} aria-label="Shop All Groceries Hero">
      {/* LEFT CONTENT COLUMN */}
      <div className={styles.contentCol}>
        <div className={styles.eyebrowBadge}>
          <LeafIcon size={14} className={styles.eyebrowIcon} aria-hidden="true" />
          <span>AUTHENTIC & DELICIOUS</span>
        </div>

        <h1 className={styles.heading}>
          All Your <span className={styles.headingHighlight}>Grocery Essentials</span> in One Place
        </h1>

        <p className={styles.description}>
          Authentic namkeen, ready-to-eat meals, pantry staples, beverages and more.
        </p>

        <a href="#products-grid" className={styles.shopNowBtn}>
          <span>Shop Now</span>
          <ArrowRightIcon size={15} aria-hidden="true" />
        </a>

        {/* 3 TRUST VALUE BADGES STRIP */}
        <div className={styles.trustStrip}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <LeafIcon size={15} />
            </div>
            <div className={styles.trustTextGroup}>
              <span className={styles.trustTitle}>Premium Quality</span>
              <span className={styles.trustSubtitle}>Handpicked for you</span>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <TruckIcon size={15} />
            </div>
            <div className={styles.trustTextGroup}>
              <span className={styles.trustTitle}>Fast Delivery</span>
              <span className={styles.trustSubtitle}>Across UK</span>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <ShieldCheckIcon size={15} />
            </div>
            <div className={styles.trustTextGroup}>
              <span className={styles.trustTitle}>Great Value</span>
              <span className={styles.trustSubtitle}>Everyday low prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT VISUAL COLUMN */}
      <div className={styles.imageCol}>
        <div className={styles.imageWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES.banners.shopAll}
            alt="Kraft grocery shopping bag filled with authentic Indian namkeen, ready-to-eat meals and groceries"
            className={styles.bannerImage}
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = IMAGES.hero.packagedFood;
            }}
          />
        </div>
      </div>
    </section>
  );
}

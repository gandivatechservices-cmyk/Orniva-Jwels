"use client";

import { DiamondIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon } from "../../icons";
import { IMAGES } from "../../../constants/images";
import styles from "./ShopAllHeroBanner.module.css";

export interface ShopAllHeroBannerProps {
  className?: string;
}

export function ShopAllHeroBanner({ className = "" }: ShopAllHeroBannerProps) {
  return (
    <section className={`${styles.bannerCard} ${className}`} aria-label="Shop All Jewelry Hero">
      {/* LEFT CONTENT COLUMN */}
      <div className={styles.contentCol}>
        <div className={styles.eyebrowBadge}>
          <DiamondIcon size={14} className={styles.eyebrowIcon} aria-hidden="true" />
          <span>FINE JEWELLERY ATELIER</span>
        </div>

        <h1 className={styles.heading}>
          Exquisite Jewellery <span className={styles.headingHighlight}>Crafted to Perfection</span>
        </h1>

        <p className={styles.description}>
          Explore certified diamond rings, hallmarked 18K and 22K gold, artisanal necklaces, and bespoke fine collections.
        </p>

        <a href="#products-grid" className={styles.shopNowBtn}>
          <span>Explore Collection</span>
          <ArrowRightIcon size={15} aria-hidden="true" />
        </a>

        {/* 3 TRUST VALUE BADGES STRIP */}
        <div className={styles.trustStrip}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <DiamondIcon size={15} />
            </div>
            <div className={styles.trustTextGroup}>
              <span className={styles.trustTitle}>100% Certified</span>
              <span className={styles.trustSubtitle}>Hallmarked Gold</span>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <TruckIcon size={15} />
            </div>
            <div className={styles.trustTextGroup}>
              <span className={styles.trustTitle}>Insured Shipping</span>
              <span className={styles.trustSubtitle}>Safe delivery</span>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <ShieldCheckIcon size={15} />
            </div>
            <div className={styles.trustTextGroup}>
              <span className={styles.trustTitle}>Lifetime Care</span>
              <span className={styles.trustSubtitle}>Complimentary cleaning</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE COLUMN */}
      <div className={styles.imageCol}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES.jewelry.heroModel}
          alt="Fine jewelry collection showcase"
          className={styles.bannerImage}
        />
      </div>
    </section>
  );
}

"use client";

import { IMAGES } from "../../../constants/images";
import styles from "./ShopAllHeroBanner.module.css";

export interface ShopAllHeroBannerProps {
  className?: string;
}

export function ShopAllHeroBanner({ className = "" }: ShopAllHeroBannerProps) {
  return (
    <section className={`${styles.bannerCard} ${className}`} aria-label="Shop All Jewelry Hero">
      <div className={styles.contentCol}>
        <h1 className={styles.heading}>Our Collection</h1>
        <p className={styles.description}>Timeless designs for every occasion</p>
      </div>

      <div className={styles.imageCol}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES.jewelry.categories.rings}
          alt="Fine jewelry collection showcase"
          className={styles.bannerImage}
        />
      </div>
    </section>
  );
}

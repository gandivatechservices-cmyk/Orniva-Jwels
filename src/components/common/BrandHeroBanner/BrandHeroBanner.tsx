"use client";

import { useState } from "react";
import { LeafIcon, SparklesIcon, TagIcon } from "components/icons";
import { CategoryHeroBanner } from "../CategoryHeroBanner";
import styles from "./BrandHeroBanner.module.css";

export type BrandHeroBannerProps = {
  name: string;
  description?: string;
  productCount?: number;
  /** Wide banner image from the brand record. Used full-width when present. */
  bannerUrl?: string;
  /** Logo from the brand record. Used when there is no banner. */
  logoUrl?: string;
};

/** Brand page header: the brand's banner as a full-width background, otherwise the layout with the logo. */
export function BrandHeroBanner({ name, description, productCount, bannerUrl, logoUrl }: BrandHeroBannerProps) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const text = description || `Shop all ${name} products.`;

  if (!bannerUrl || bannerFailed) {
    return (
      <CategoryHeroBanner
        eyebrowText="BRAND"
        categoryName={name}
        productCount={productCount}
        imageSrc={logoUrl}
        imageAlt={`${name} logo`}
        description={text}
      />
    );
  }

  return (
    <div className={styles.banner} role="banner" aria-label={name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerUrl} alt={`${name} banner`} className={styles.bg} loading="eager" onError={() => setBannerFailed(true)} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <LeafIcon size={14} aria-hidden="true" />
          <span>BRAND</span>
        </div>
        <div className={styles.titleRow}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={`${name} logo`} className={styles.logo} />
          )}
          <h1 className={styles.title}>{name}</h1>
        </div>
        <p className={styles.description}>{text}</p>
        <div className={styles.chips}>
          {typeof productCount === "number" && (
            <span className={styles.chip}>
              <TagIcon size={13} /> <strong>{productCount}</strong> {productCount === 1 ? "Product" : "Products"} Available
            </span>
          )}
          <span className={styles.chip}>
            <SparklesIcon size={13} /> 100% Quality Checked
          </span>
        </div>
      </div>
    </div>
  );
}

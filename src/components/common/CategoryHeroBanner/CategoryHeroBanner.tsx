"use client";

import { DiamondIcon, SparklesIcon, TagIcon } from "components/icons";
import { useState } from "react";
import styles from "./CategoryHeroBanner.module.css";

export type CategoryHeroBannerProps = {
  eyebrowText?: string;
  categoryName: string;
  description?: string;
  productCount?: number;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

/**
 * Curated category hero descriptions and photography defaults
 */
export function getCategoryHeroDefaults(categorySlugOrName: string) {
  const norm = (categorySlugOrName || "").toLowerCase().trim();

  if (norm.includes("ring")) {
    return {
      eyebrow: "FINE RINGS COLLECTION",
      defaultTitle: "Rings",
      description: "Timeless designs for every occasion. From certified solitaire diamond rings to handcrafted 18K gold eternity bands.",
      fallbackImage: "/assets/images/jewelry/category-rings.jpg",
    };
  }
  if (norm.includes("necklace") || norm.includes("choker")) {
    return {
      eyebrow: "EXQUISITE NECKLACES",
      defaultTitle: "Necklaces",
      description: "Breathtaking diamond pendants, bridal chokers, and delicate gold chains crafted for lasting elegance.",
      fallbackImage: "/assets/images/jewelry/category-necklaces.jpg",
    };
  }
  if (norm.includes("earring") || norm.includes("stud")) {
    return {
      eyebrow: "ARTISANAL EARRINGS",
      defaultTitle: "Earrings",
      description: "Dazzling diamond studs, timeless gold hoops, and glamorous drop earrings designed to shine.",
      fallbackImage: "/assets/images/jewelry/category-earrings.jpg",
    };
  }
  if (norm.includes("bracelet")) {
    return {
      eyebrow: "TIMELESS BRACELETS",
      defaultTitle: "Bracelets",
      description: "Shimmering diamond tennis bracelets, contemporary cuffs, and classic chain designs in 18K gold.",
      fallbackImage: "/assets/images/jewelry/category-bracelets.jpg",
    };
  }
  if (norm.includes("bangle") || norm.includes("kada")) {
    return {
      eyebrow: "HERITAGE BANGLES",
      defaultTitle: "Bangles",
      description: "Handcrafted 22K gold filigree bangles, temple motifs, and modern stacking cuffs.",
      fallbackImage: "/assets/images/jewelry/category-bangles.jpg",
    };
  }
  if (norm.includes("pendant")) {
    return {
      eyebrow: "PRECIOUS PENDANTS",
      defaultTitle: "Pendants",
      description: "Captivating solitaire and gemstone pendants set in hallmarked gold and platinum.",
      fallbackImage: "/assets/images/jewelry/category-necklaces.jpg",
    };
  }
  if (norm.includes("men")) {
    return {
      eyebrow: "MEN'S COLLECTION",
      defaultTitle: "Men's Jewellery",
      description: "Bold signet rings, gold chains, and refined diamond cufflinks designed for men.",
      fallbackImage: "/assets/images/jewelry/category-mens.jpg",
    };
  }
  if (norm.includes("wedding") || norm.includes("bridal") || norm.includes("bride")) {
    return {
      eyebrow: "BRIDAL & WEDDING",
      defaultTitle: "Wedding Collection",
      description: "Heirloom bridal sets, engagement rings, and wedding jewellery crafted to celebrate eternal love.",
      fallbackImage: "/assets/images/jewelry/category-rings.jpg",
    };
  }

  // General Fine Jewelry default
  return {
    eyebrow: "LUXE JWELS ATELIER",
    defaultTitle: "Fine Jewellery",
    description: "Discover handcrafted luxury jewelry designed to celebrate life's most precious milestones.",
    fallbackImage: "/assets/images/jewelry/category-rings.jpg",
  };
}

export function CategoryHeroBanner({
  eyebrowText,
  categoryName,
  description,
  productCount,
  imageSrc,
  imageAlt,
  className = "",
}: CategoryHeroBannerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const defaults = getCategoryHeroDefaults(categoryName);

  const displayEyebrow = eyebrowText || defaults.eyebrow;
  const displayDesc = description || defaults.description;
  const displayImage = (!imageFailed && (imageSrc || defaults.fallbackImage)) ? (imageSrc || defaults.fallbackImage) : "";
  const displayAlt = imageAlt || `${categoryName} fine jewelry collection`;

  return (
    <div className={`${styles.bannerCard} ${className}`} role="banner" aria-label={categoryName}>
      {/* LEFT CONTENT COLUMN */}
      <div className={styles.contentCol}>
        {displayEyebrow && (
          <div className={styles.eyebrowBadge}>
            <DiamondIcon size={14} className={styles.eyebrowIcon} aria-hidden="true" />
            <span>{displayEyebrow}</span>
          </div>
        )}

        <h1 className={styles.categoryTitle}>{categoryName}</h1>

        <p className={styles.categoryDescription}>{displayDesc}</p>

        {/* METADATA CHIPS ROW */}
        <div className={styles.metaRow}>
          {typeof productCount === "number" && (
            <div className={styles.metaChip}>
              <TagIcon size={13} className={styles.metaChipIcon} />
              <span>
                <strong>{productCount}</strong> {productCount === 1 ? "Piece" : "Pieces"} Available
              </span>
            </div>
          )}

          <div className={styles.metaChip}>
            <SparklesIcon size={13} className={styles.metaChipIcon} />
            <span>100% Certified &amp; Hallmarked</span>
          </div>
        </div>
      </div>

      {/* RIGHT PICTURE COLUMN */}
      {displayImage && (
        <div className={styles.imageCol}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={displayAlt}
            className={styles.categoryHeroImg}
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
    </div>
  );
}

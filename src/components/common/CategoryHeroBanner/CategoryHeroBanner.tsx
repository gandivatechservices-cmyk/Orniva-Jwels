"use client";

import { LeafIcon, SparklesIcon, TagIcon } from "components/icons";
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

  if (norm.includes("fresh") || norm.includes("produce") || norm.includes("fruit") || norm.includes("veg")) {
    return {
      eyebrow: "FARM FRESH SELECTION",
      defaultTitle: "Fruits & Vegetables",
      description: "Crisp vegetables, juicy seasonal fruits, and vibrant leafy greens handpicked daily.",
    };
  }
  if (norm.includes("dairy") || norm.includes("egg")) {
    return {
      eyebrow: "CHILLED ESSENTIALS",
      defaultTitle: "Dairy, Bread & Eggs",
      description: "Fresh milk, farm-fresh eggs, butter, artisanal cheeses, and rich creamy yogurts.",
    };
  }
  if (norm.includes("bakery") || norm.includes("bread")) {
    return {
      eyebrow: "FRESHLY BAKED DAILY",
      defaultTitle: "Bakery & Bread",
      description: "Artisan sourdough, whole-wheat loaves, warm burger buns, and delicious pastries.",
    };
  }
  if (norm.includes("rice") || norm.includes("grain") || norm.includes("atta") || norm.includes("flour")) {
    return {
      eyebrow: "PANTRY STAPLES",
      defaultTitle: "Atta, Rice, Oil & Dals",
      description: "Premium aged basmati rice, nutritious lentils, flour, and healthy cooking oils.",
    };
  }
  if (norm.includes("indian") || norm.includes("asian") || norm.includes("spice") || norm.includes("masala")) {
    return {
      eyebrow: "AUTHENTIC FLAVOURS",
      defaultTitle: "Indian & Asian Grocery",
      description: "Aromatic whole spices, lentils, ghee, seasonings, and authentic heritage brand ingredients.",
    };
  }
  if (norm.includes("meat") || norm.includes("fish") || norm.includes("seafood")) {
    return {
      eyebrow: "PREMIUM CUTS",
      defaultTitle: "Meat, Fish & Seafood",
      description: "Tender cuts of fresh poultry, succulent seafood, and quality meats sourced with care.",
    };
  }
  if (norm.includes("frozen") || norm.includes("ice cream")) {
    return {
      eyebrow: "QUICK & CONVENIENT",
      defaultTitle: "Frozen Food",
      description: "Crisp frozen veggies, ready-to-cook appetisers, frozen parathas, and gourmet desserts.",
    };
  }
  if (norm.includes("drink") || norm.includes("beverage") || norm.includes("juice") || norm.includes("tea")) {
    return {
      eyebrow: "REFRESHING SIPS",
      defaultTitle: "Drinks & Beverages",
      description: "100% natural fruit juices, specialty teas, roasted coffee blends, and cooling sodas.",
    };
  }
  if (norm.includes("snack") || norm.includes("biscuit") || norm.includes("munchies")) {
    return {
      eyebrow: "CRUNCHY & DELICIOUS",
      defaultTitle: "Snacks & Munchies",
      description: "Savoury crisps, healthy roasted trail nuts, artisanal biscuits, and sweet confectioneries.",
    };
  }
  if (norm.includes("house") || norm.includes("cleaning")) {
    return {
      eyebrow: "HOME CARE ESSENTIALS",
      defaultTitle: "Household & Cleaning",
      description: "Eco-friendly home cleaners, detergents, paper rolls, and kitchen maintenance supplies.",
    };
  }
  if (norm.includes("beauty") || norm.includes("personal")) {
    return {
      eyebrow: "PERSONAL WELLNESS",
      defaultTitle: "Beauty & Personal Care",
      description: "Nourishing skincare, botanical shampoos, soaps, and everyday self-care essentials.",
    };
  }

  // General Grocery & Kitchen default
  return {
    eyebrow: "SHOP BY CATEGORY",
    defaultTitle: "Grocery & Kitchen",
    description: "Everything you need for your everyday kitchen, from farm-fresh produce to pantry staples.",
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
  // The picture comes from the database record only. No bundled photo is used.
  const [imageFailed, setImageFailed] = useState(false);
  const defaults = getCategoryHeroDefaults(categoryName);

  const displayEyebrow = eyebrowText || defaults.eyebrow;
  const displayDesc = description || defaults.description;
  const displayImage = imageSrc && !imageFailed ? imageSrc : "";
  const displayAlt = imageAlt || `${categoryName} grocery collection`;

  return (
    <div className={`${styles.bannerCard} ${className}`} role="banner" aria-label={categoryName}>
      {/* LEFT CONTENT COLUMN */}
      <div className={styles.contentCol}>
        {displayEyebrow && (
          <div className={styles.eyebrowBadge}>
            <LeafIcon size={14} className={styles.eyebrowIcon} aria-hidden="true" />
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
                <strong>{productCount}</strong> {productCount === 1 ? "Product" : "Products"} Available
              </span>
            </div>
          )}

          <div className={styles.metaChip}>
            <SparklesIcon size={13} className={styles.metaChipIcon} />
            <span>100% Quality Checked</span>
          </div>
        </div>
      </div>

      {/* RIGHT PICTURE COLUMN (only when the record has an image) */}
      {displayImage && (
        <div className={styles.imageCol}>
          <div className={styles.imageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayImage} alt={displayAlt} className={styles.bannerImage} loading="eager" onError={() => setImageFailed(true)} />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { PriceTagIcon, CartIcon, LeafIcon, SpiceStarIcon, ArrowRightIcon } from "components/icons";
import { Skeleton } from "components/ui/Skeleton";
import type { PromoBannerProps } from "./types";
import styles from "./PromoBanner.module.css";

export function PromoBanner({
  title,
  description,
  subtitle,
  label,
  labelIcon,
  discountBadge,
  cornerBadge,
  buttonText,
  ctaText = "Shop Now",
  href,
  onClick,
  variant = "offers",
  image,
  imageAlt = "Promotion banner image",
  imageFit = "contain",
  disabled = false,
  loading = false,
  className = "",
}: PromoBannerProps) {
  if (loading) {
    return <PromoBannerSkeleton className={className} />;
  }

  const normalizedVariant = variant.replace(/-/g, "_");
  const variantClass = styles[`variant_${normalizedVariant}`] || styles.variant_offers;
  const rawBtnLabel = buttonText || ctaText;
  const btnLabel = typeof rawBtnLabel === "string" ? rawBtnLabel.replace(/[→\s]+$/, "").trim() : rawBtnLabel;
  const bodyText = description || subtitle;

  const defaultIcon =
    variant === "fresh-today" || variant === "green" || variant === "primary"
      ? <LeafIcon size={14} className={styles.labelIconGreen} aria-hidden="true" />
      : variant === "indian-grocery" || variant === "terracotta" || variant === "peach"
      ? <SpiceStarIcon size={14} className={styles.labelIconSpice} aria-hidden="true" />
      : variant === "offers" || variant === "pink"
      ? <PriceTagIcon size={14} className={styles.labelIconRed} aria-hidden="true" />
      : <CartIcon size={14} className={styles.labelIconGreen} aria-hidden="true" />;

  return (
    <div
      className={`${styles.banner} ${variantClass} ${className}`}
      role="region"
      aria-label={typeof title === "string" ? title : "Promotion"}
    >
      {/* CONTENT LEFT */}
      <div className={styles.content}>
        {label && (
          <div className={styles.labelBadge}>
            {labelIcon || defaultIcon}
            <span className={styles.labelText}>{label}</span>
          </div>
        )}

        <h3 className={styles.title}>{title}</h3>
        {bodyText && <p className={styles.description}>{bodyText}</p>}

        {disabled ? (
          <button
            type="button"
            disabled
            className={`${styles.ctaBtn} ${styles.ctaBtnDisabled}`}
          >
            <span>{btnLabel}</span>
            <ArrowRightIcon size={15} className={styles.ctaBtnArrow} aria-hidden="true" />
          </button>
        ) : href ? (
          <Link href={href} prefetch={false} className={styles.ctaBtnWrap}>
            <button
              type="button"
              className={styles.ctaBtn}
            >
              <span>{btnLabel}</span>
              <ArrowRightIcon size={15} className={styles.ctaBtnArrow} aria-hidden="true" />
            </button>
          </Link>
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            className={styles.ctaBtn}
          >
            <span>{btnLabel}</span>
            <ArrowRightIcon size={15} className={styles.ctaBtnArrow} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className={styles.ctaBtn}
          >
            <span>{btnLabel}</span>
            <ArrowRightIcon size={15} className={styles.ctaBtnArrow} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ART RIGHT */}
      <div className={styles.artSlot} aria-hidden="true">
        {discountBadge && (
          <div className={styles.discountBadge}>
            <span className={styles.discountUpTo}>UP TO</span>
            <span className={styles.discountPercent}>50%</span>
            <span className={styles.discountOff}>OFF</span>
          </div>
        )}

        {cornerBadge && (
          <div className={styles.cornerBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#087443" stroke="#087443" strokeWidth="1.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            </svg>
            <div className={styles.cornerBadgeContent}>
              <span className={styles.cornerBadgeBold}>100%</span>
              <span className={styles.cornerBadgeSub}>Farm Fresh</span>
            </div>
          </div>
        )}

        {typeof image === "string" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={imageAlt}
            className={`${styles.artImage} ${imageFit === "cover" ? styles.artImageCover : ""}`}
            loading="lazy"
          />
        ) : (
          image
        )}
      </div>
    </div>
  );
}

export function PromoBannerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonBanner} ${className}`} aria-hidden="true">
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "55%" }}>
        <Skeleton width="100px" height="20px" style={{ borderRadius: "9999px" }} />
        <Skeleton width="160px" height="32px" />
        <Skeleton width="220px" height="14px" />
        <Skeleton width="110px" height="40px" style={{ borderRadius: "9999px" }} />
      </div>
      <Skeleton width="160px" height="140px" variant="rectangular" style={{ borderRadius: "16px" }} />
    </div>
  );
}

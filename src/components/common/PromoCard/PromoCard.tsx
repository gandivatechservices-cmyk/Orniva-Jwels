"use client";

import Link from "next/link";
import { ArrowRightIcon } from "../../icons";
import { Skeleton } from "../../ui/Skeleton";
import type { PromoCardProps } from "./types";
import styles from "./PromoCard.module.css";

export function PromoCard({
  title,
  subtitle,
  badge,
  ctaText = "Shop Now",
  href,
  onClick,
  variant = "primary",
  art,
  artImage,
  backgroundImage,
  loading = false,
  className = "",
  disabled = false,
}: PromoCardProps) {
  if (loading) {
    return <PromoCardSkeleton className={className} />;
  }

  const variantClass = styles[`variant_${variant}`] || styles.variant_primary;

  return (
    <div className={`${styles.card} ${variantClass} ${backgroundImage ? styles.hasBgImage : ""} ${className}`}>
      {backgroundImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className={styles.bgImage}
            loading="lazy"
          />
          <div className={styles.bgOverlay} />
        </>
      )}
      <div className={styles.content}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        {disabled && ctaText ? (
          <button type="button" disabled className={`${styles.ctaBtn} ${styles.ctaBtnDisabled}`} aria-disabled="true">
            <span>{ctaText}</span>
          </button>
        ) : href ? (
          <Link href={href} prefetch={false} className={styles.ctaBtn}>
            <span>{ctaText}</span>
            <ArrowRightIcon size={14} />
          </Link>
        ) : onClick ? (
          <button type="button" onClick={onClick} className={styles.ctaBtn}>
            <span>{ctaText}</span>
            <ArrowRightIcon size={14} />
          </button>
        ) : null}
      </div>

      <div className={styles.artSlot}>
        {art ? (
          art
        ) : artImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artImage} alt={title} className={styles.artImage} loading="lazy" />
        ) : null}
      </div>
    </div>
  );
}

export function PromoCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.card} ${styles.variant_cream} ${className}`}>
      <div className={styles.content} style={{ width: "60%" }}>
        <Skeleton width="60px" height="18px" />
        <Skeleton width="100%" height="24px" />
        <Skeleton width="80%" height="16px" />
        <Skeleton width="90px" height="32px" />
      </div>
      <div className={styles.artSlot}>
        <Skeleton width="100px" height="100px" variant="rectangular" />
      </div>
    </div>
  );
}

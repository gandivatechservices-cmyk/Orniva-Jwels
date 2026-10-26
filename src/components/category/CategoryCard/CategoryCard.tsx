"use client";

import { useState } from "react";
import Link from "next/link";
import { Skeleton } from "components/ui/Skeleton";
import { ChevronRightIcon } from "components/icons";
import type { CategoryCardProps } from "./types";
import styles from "./CategoryCard.module.css";

export function CategoryCard({
  id,
  name,
  slug,
  image,
  icon,
  bgTint,
  isPopular = false,
  href,
  isActive = false,
  loading = false,
  onClick,
  className = "",
}: CategoryCardProps) {
  // The image comes from the category record in the database. If it is missing or fails to load, a letter tile is shown.
  const [imageFailed, setImageFailed] = useState(false);

  if (loading) {
    return <CategoryCardSkeleton className={className} />;
  }

  const destination = href || (slug ? `/category/${encodeURIComponent(slug)}` : `/products?categoryId=${id}`);
  const imgSrc = image && image.trim() !== "" ? image : "";

  const innerContent = (
    <>
      {isPopular && <span className={styles.popularBadge}>Featured</span>}
      <div className={styles.imageContainer}>
        {imgSrc && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={name} className={styles.image} loading="lazy" onError={() => setImageFailed(true)} />
        ) : icon ? (
          <div className={styles.iconSlot}>{icon}</div>
        ) : (
          <div
            className={styles.iconSlot}
            style={{ background: bgTint || "#FAF5EE", fontSize: 40, fontWeight: 800, color: "#8E662F", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-hidden="true"
          >
            {name.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className={styles.meta}>
        <h3 className={styles.name} title={name}>
          {name}
        </h3>
        <div className={styles.ctaRow}>
          <span className={styles.ctaText}>Shop Category</span>
          <div className={styles.arrowPill}>
            <ChevronRightIcon size={12} className={styles.arrowIcon} />
          </div>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(id)}
        className={`${styles.card} ${isActive ? styles.active : ""} ${className}`}
        aria-label={`Shop ${name}`}
      >
        {innerContent}
      </button>
    );
  }

  return (
    <Link
      href={destination}
      prefetch={false}
      className={`${styles.card} ${isActive ? styles.active : ""} ${className}`}
      aria-label={`Shop ${name}`}
    >
      {innerContent}
    </Link>
  );
}

export function CategoryCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`} aria-hidden="true">
      <Skeleton width="104px" height="104px" variant="circular" style={{ borderRadius: "50%" }} />
      <Skeleton width="70%" height="16px" style={{ marginTop: "12px" }} />
      <Skeleton width="45%" height="12px" style={{ marginTop: "6px" }} />
    </div>
  );
}


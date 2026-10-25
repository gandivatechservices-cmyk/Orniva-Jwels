"use client";

import Link from "next/link";
import { ArrowRightIcon } from "components/icons";
import { Skeleton } from "../../ui/Skeleton";
import type { RecipeCardProps } from "./types";
import styles from "./RecipeCard.module.css";

export function RecipeCard({
  id,
  title,
  image,
  badgeIcon,
  badgeBg,
  badgeColor,
  href,
  loading = false,
  onClick,
  className = "",
}: RecipeCardProps & { href?: string }) {
  if (loading) {
    return <RecipeCardSkeleton className={className} />;
  }

  const destination = href || `/products?recipe=${encodeURIComponent(id)}`;

  const content = (
    <>
      <div className={styles.imageWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className={styles.image} loading="lazy" />
        {badgeIcon && (
          <div
            className={styles.badge}
            style={{
              backgroundColor: badgeBg || "rgba(255, 255, 255, 0.9)",
              color: badgeColor || "#087443",
            }}
            aria-hidden="true"
          >
            {badgeIcon}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h4 className={styles.title} title={title}>
          {title}
        </h4>
        <span className={styles.viewRecipe}>
          View Recipe <ArrowRightIcon size={14} className={styles.viewArrow} aria-hidden="true" />
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <article
        className={`${styles.card} ${className}`}
        onClick={() => onClick(id)}
        role="button"
        tabIndex={0}
      >
        {content}
      </article>
    );
  }

  return (
    <Link href={destination} prefetch={false} className={`${styles.card} ${className}`}>
      {content}
    </Link>
  );
}

export function RecipeCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`} aria-hidden="true">
      <Skeleton width="100%" height="130px" variant="rectangular" />
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton width="80%" height="16px" />
        <Skeleton width="60px" height="12px" />
      </div>
    </div>
  );
}

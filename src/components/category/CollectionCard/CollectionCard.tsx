"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "components/icons";
import { Skeleton } from "components/ui/Skeleton";
import { IMAGES } from "constants/images";
import type { CollectionCardProps } from "./types";
import styles from "./CollectionCard.module.css";

export function CollectionCard({
  id,
  name,
  slug,
  image,
  description,
  subcategories = [],
  className = "",
}: CollectionCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const displayImg =
    image && image.trim() !== "" && !imageFailed ? image : IMAGES.placeholders.product;

  const destination = slug ? `/category/${encodeURIComponent(slug)}` : `/products?categoryId=${id}`;

  return (
    <Link
      href={destination}
      prefetch={false}
      className={`${styles.card} ${className}`}
      aria-label={`Explore ${name} collection`}
    >
      <div className={styles.imageWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImg}
          alt={name}
          className={styles.image}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <div className={styles.imageOverlay} />
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{name}</h3>
        </div>

        {description && description.trim() !== "" ? (
          <p className={styles.description}>{description}</p>
        ) : null}

        {subcategories.length > 0 && (
          <div className={styles.subcategoriesList} onClick={(e) => e.stopPropagation()}>
            {subcategories.slice(0, 4).map((sub) => (
              <span key={sub.id} className={styles.subcategoryChip}>
                {sub.name}
              </span>
            ))}
            {subcategories.length > 4 && (
              <span className={styles.subcategoryChip}>+{subcategories.length - 4} more</span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.actionText}>
            <span>Explore Collection</span>
            <ArrowRightIcon size={13} className={styles.actionArrow} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CollectionCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <Skeleton width="60%" height="24px" style={{ borderRadius: "4px" }} />
        <Skeleton width="90%" height="16px" style={{ borderRadius: "4px" }} />
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #F3EDE3" }}>
          <Skeleton width="40%" height="16px" style={{ borderRadius: "4px" }} />
        </div>
      </div>
    </div>
  );
}

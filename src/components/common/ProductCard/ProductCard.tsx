import { memo } from "react";
import Link from "next/link";
import { Skeleton } from "../../ui/Skeleton";
import { HeartIcon, ShoppingBagIcon, StarIcon } from "../../icons";
import { formatPrice } from "../../../utility/formatMoney";
import { IMAGES } from "../../../constants/images";
import { LOW_STOCK_THRESHOLD } from "../../../utility/variantPricing";
import type { ProductCardProps } from "./types";
import styles from "./ProductCard.module.css";

export const ProductCard = memo(function ProductCard({
  id,
  name,
  price,
  currency = "GBP",
  image,
  brand,
  weight,
  unit,
  comparePrice,
  offerLabel,
  rating,
  reviewCount,
  stock = 10,
  priceFrom = false,
  selectOptions = false,
  isWishlisted = false,
  cartQty = 0,
  loading = false,
  onAddToCart,
  onUpdateQty,
  onToggleWishlist,
  onClick,
  className = "",
}: ProductCardProps) {
  if (loading) {
    return <ProductCardSkeleton className={className} />;
  }

  const isOutOfStock = stock <= 0;
  const hasDiscount = Boolean(comparePrice && comparePrice > price);
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;
  const isLowStock = !isOutOfStock && stock <= LOW_STOCK_THRESHOLD;
  const rawWeight = (weight || unit || "").trim();
  // Bare numbers like "45" are gram weights — show the unit so it reads clearly.
  const displayWeight = /^\d+(\.\d+)?$/.test(rawWeight) ? `${rawWeight} g` : rawWeight;
  const hasRating = typeof rating === "number" && rating > 0;

  const imgSrc = image && image.trim() !== "" ? image : IMAGES.placeholders.product;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id, 1);
  };

  return (
    <article
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ""} ${className}`}
      data-testid={`product-card-${id}`}
    >
      {/* 1. MEDIA CONTAINER */}
      <div className={styles.imageWrapper}>
        {hasDiscount && (
          <div className={styles.discountBadge}>
            -{discountPercent}%
          </div>
        )}

        <button
          type="button"
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(id);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon size={16} filled={isWishlisted} />
        </button>

        <Link
          href={`/products/${id}`}
          prefetch={false}
          className={styles.imageLink}
          onClick={() => onClick?.(id)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={name}
            className={styles.image}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = IMAGES.placeholders.product;
            }}
          />
        </Link>

        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span className={styles.outOfStockBadge}>Out of Stock</span>
          </div>
        )}
      </div>

      {/* 2. PRODUCT INFO */}
      <div className={styles.info}>
        <div className={styles.metaRow}>
          <span className={styles.brand}>
            {brand && brand.trim() !== "" ? brand : "LUXE JWELS"}
          </span>
          {hasRating && (
            <span className={styles.rating} aria-label={`Rated ${rating!.toFixed(1)} out of 5`}>
              <StarIcon size={11} filled className={styles.starIcon} />
              <span className={styles.ratingValue}>{rating!.toFixed(1)}</span>
              {reviewCount ? <span className={styles.reviewCount}>({reviewCount})</span> : null}
            </span>
          )}
        </div>

        <Link
          href={`/products/${id}`}
          prefetch={false}
          className={styles.title}
          onClick={() => onClick?.(id)}
          title={name}
        >
          {name}
        </Link>

        {(displayWeight || isLowStock) && (
          <div className={styles.detailRow}>
            {displayWeight && <span className={styles.weight}>{displayWeight}</span>}
            {isLowStock && <span className={styles.lowStock}>Only {stock} left</span>}
          </div>
        )}

        <div className={styles.priceContainer}>
          <div className={styles.priceRow}>
            {priceFrom && <span className={styles.priceFrom}>From</span>}
            <span className={styles.price}>{formatPrice(price, currency)}</span>
            {hasDiscount && (
              <span className={styles.comparePrice}>
                {formatPrice(comparePrice!, currency)}
              </span>
            )}
          </div>
          {offerLabel && <span className={styles.offerTag}>{offerLabel}</span>}
        </div>
      </div>

      {/* 3. ACTION / PURCHASE ROW (ADD TO CART) */}
      <div className={styles.actionRow}>
        {isOutOfStock ? (
          <button type="button" className={styles.addBtnDisabled} disabled>
            Out of Stock
          </button>
        ) : selectOptions ? (
          <Link href={`/products/${id}`} prefetch={false} className={styles.addBtn} onClick={() => onClick?.(id)}>
            <span className={styles.addBtnText}>Select options</span>
          </Link>
        ) : (
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAdd}
            aria-label={`Add ${name} to cart`}
          >
            <ShoppingBagIcon size={14} className={styles.addBtnIcon} />
            <span className={styles.addBtnText}>
              {cartQty > 0 ? `In Cart (${cartQty})` : "Add to Cart"}
            </span>
          </button>
        )}
      </div>
    </article>
  );
});

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonCard} ${className}`} aria-hidden="true">
      <div className={styles.skeletonImageWrapper}>
        <Skeleton height="100%" variant="rectangular" style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: "8px" }} />
      </div>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
        <Skeleton width="45%" height="10px" style={{ borderRadius: "4px" }} />
        <Skeleton width="25%" height="10px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "5px" }}>
        <Skeleton width="90%" height="14px" style={{ borderRadius: "4px" }} />
        <Skeleton width="65%" height="14px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "5px" }}>
        <Skeleton width="35%" height="10px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "baseline" }}>
        <Skeleton width="60px" height="18px" style={{ borderRadius: "4px" }} />
        <Skeleton width="40px" height="12px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "10px" }}>
        <Skeleton width="100%" height="36px" variant="rectangular" style={{ borderRadius: "6px" }} />
      </div>
    </div>
  );
}


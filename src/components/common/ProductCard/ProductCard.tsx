"use client";

import { memo } from "react";
import Link from "next/link";
import { Skeleton } from "../../ui/Skeleton";
import { HeartIcon } from "../../icons";
import { ShoppingBasketIcon } from "../../icons/category";
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
  const savingsAmount = hasDiscount ? comparePrice! - price : 0;
  const displayWeight = weight || unit;

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
            {brand && brand.trim() !== "" ? brand : "FRESHMART"}
          </span>
          {isOutOfStock ? (
            <span className={styles.stockStatusOut}>
              <span className={styles.stockDotOut} />
              Out of Stock
            </span>
          ) : (
            <span className={styles.stockStatus}>
              <span className={styles.stockDot} />
              {stock <= LOW_STOCK_THRESHOLD ? `Only ${stock} left` : "In Stock"}
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

        {displayWeight ? (
          <span className={styles.weight}>{displayWeight}</span>
        ) : (
          <span className={styles.weightSpacer} aria-hidden="true" />
        )}

        <div className={styles.priceContainer}>
          <div className={styles.priceRow}>
            <div className={styles.priceValues}>
              {priceFrom && <span className={styles.priceFrom}>From</span>}
              <span className={styles.price}>{formatPrice(price, currency)}</span>
              {hasDiscount && (
                <span className={styles.comparePrice}>
                  {formatPrice(comparePrice!, currency)}
                </span>
              )}
            </div>
            {hasDiscount && savingsAmount > 0 ? (
              <span className={styles.savingsTag}>
                Save {formatPrice(savingsAmount, currency)}
              </span>
            ) : (
              <span className={styles.savingsSpacer} aria-hidden="true" />
            )}
          </div>
          {offerLabel && <span className={styles.offerTag}>{offerLabel}</span>}
        </div>
      </div>

      {/* 3. ACTION / PURCHASE ROW (ADD TO BASKET) */}
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
            aria-label={`Add ${name} to basket`}
          >
            <ShoppingBasketIcon size={15} strokeWidth={2} className={styles.addBtnIcon} />
            <span className={styles.addBtnText}>
              {cartQty > 0 ? `In Basket (${cartQty})` : "Add to Basket"}
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
      <Skeleton height="180px" variant="rectangular" style={{ borderRadius: "14px" }} />
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between" }}>
        <Skeleton width="45%" height="12px" style={{ borderRadius: "4px" }} />
        <Skeleton width="25%" height="12px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton width="90%" height="16px" style={{ borderRadius: "4px" }} />
        <Skeleton width="65%" height="16px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "6px" }}>
        <Skeleton width="35%" height="12px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "baseline" }}>
        <Skeleton width="68px" height="22px" style={{ borderRadius: "6px" }} />
        <Skeleton width="48px" height="14px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "6px" }}>
        <Skeleton width="40%" height="16px" style={{ borderRadius: "4px" }} />
      </div>
      <div style={{ marginTop: "14px" }}>
        <Skeleton width="100%" height="42px" variant="rectangular" style={{ borderRadius: "12px" }} />
      </div>
    </div>
  );
}


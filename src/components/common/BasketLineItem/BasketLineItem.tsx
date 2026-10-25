"use client";

import { memo } from "react";
import Link from "next/link";
import { QuantityStepper } from "../../ui/QuantityStepper";
import { Skeleton } from "../../ui/Skeleton";
import { TrashIcon } from "../../icons";
import { formatPrice } from "../../../utility/formatMoney";
import { IMAGES } from "../../../constants/images";
import type { BasketLineItemProps } from "./types";
import styles from "./BasketLineItem.module.css";

export const BasketLineItem = memo(function BasketLineItem({
  keyId,
  productId,
  name,
  price,
  comparePrice,
  qty,
  bonusQty = 0,
  stock = 99,
  variantLabel,
  image,
  currency = "GBP",
  loading = false,
  onUpdateQty,
  onRemove,
  className = "",
}: BasketLineItemProps) {
  if (loading) {
    return <BasketLineItemSkeleton className={className} />;
  }

  const lineTotal = price * qty;
  const hasDiscount = Boolean(comparePrice && comparePrice > price);
  const discountPercent = hasDiscount ? Math.round(((comparePrice! - price) / comparePrice!) * 100) : 0;
  const imgSrc = image && image.trim() !== "" ? image : IMAGES.placeholders.product;

  return (
    <div className={`${styles.item} ${className}`} data-testid={`basket-item-${keyId}`}>
      <div className={styles.leftGroup}>
        <div className={styles.imageWrapper}>
          {hasDiscount && <span className={styles.discountBadge}>-{discountPercent}%</span>}
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
        </div>

        <div className={styles.details}>
          <Link href={`/products/${productId}`} className={styles.name} title={name}>
            {name}
          </Link>
          {variantLabel && <span className={styles.variantLabel}>{variantLabel}</span>}
          {bonusQty > 0 && (
            <span className={styles.bonusBadge}>+{bonusQty} FREE (Buy {qty}, Get {bonusQty})</span>
          )}
          <span className={styles.unitPrice}>
            {formatPrice(price, currency)} each
            {hasDiscount && (
              <>
                {" "}
                <span className={styles.comparePrice}>{formatPrice(comparePrice!, currency)}</span>
                <span className={styles.saveTag}>Save {discountPercent}%</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className={styles.rightGroup}>
        <QuantityStepper
          value={qty}
          min={1}
          max={stock}
          size="md"
          onChange={(newQty) => onUpdateQty?.(keyId, newQty)}
        />

        <div className={styles.subtotalCol}>
          <span className={styles.subtotal}>{formatPrice(lineTotal, currency)}</span>
        </div>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => onRemove?.(keyId)}
          aria-label={`Remove ${name} from basket`}
          title="Remove item"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
});

export function BasketLineItemSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.skeletonItem} ${className}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
        <Skeleton width="56px" height="56px" variant="rectangular" />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <Skeleton width="60%" height="16px" />
          <Skeleton width="30%" height="12px" />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Skeleton width="80px" height="32px" variant="rectangular" />
        <Skeleton width="50px" height="16px" />
        <Skeleton width="32px" height="32px" variant="rectangular" />
      </div>
    </div>
  );
}

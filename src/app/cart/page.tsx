"use client";

import { useEffect, useMemo, useState, useRef, Suspense, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { BasketLineItem, BasketLineItemSkeleton } from "../../components/common/BasketLineItem";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  LockIcon,
  TrashIcon,
  CartIcon,
  PriceTagIcon,
  SparklesIcon,
  TruckIcon,
} from "../../components/icons";
import { useAuth, useCart } from "hooks";
import { offersService, type Coupon } from "../../utility/services/offers";
import { findBestItemOffer, estimateItemComparePrice } from "../../utility/activeOffers";
import { formatPrice } from "../../utility/formatMoney";
import type { CartItem } from "../../store/slices/cartSlice";
import styles from "./cart.module.css";

/* -------------------------------------------------------------------------- */
/* Subcomponents: Memoized for Targeted, Surgical Re-rendering                */
/* -------------------------------------------------------------------------- */

const CartLoadingSkeleton = memo(function CartLoadingSkeleton() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.itemsCard}>
        <div className={styles.itemsCardHeader}>
          <Skeleton width="180px" height="20px" />
          <Skeleton width="70px" height="24px" style={{ borderRadius: "9999px" }} />
        </div>
        <div className={styles.itemsList}>
          <BasketLineItemSkeleton />
          <BasketLineItemSkeleton />
          <BasketLineItemSkeleton />
        </div>
      </div>
      <div className={styles.summaryCard}>
        <div className={styles.summaryCardHeader}>
          <Skeleton width="140px" height="24px" />
          <Skeleton width="60px" height="24px" style={{ borderRadius: "9999px" }} />
        </div>
        <Skeleton width="100%" height="40px" />
        <Skeleton width="100%" height="40px" />
        <Skeleton width="100%" height="52px" style={{ borderRadius: "9999px", marginTop: "12px" }} />
      </div>
    </div>
  );
});

interface CartHeaderProps {
  totalItems: number;
  hasItems: boolean;
  onClear: () => void;
}

const CartHeader = memo(function CartHeader({
  totalItems,
  hasItems,
  onClear,
}: CartHeaderProps) {
  return (
    <div className={styles.headingRow}>
      <div className={styles.headingLeft}>
        <h1 className={styles.title}>Your Basket</h1>
        {hasItems && (
          <span className={styles.itemCountBadge}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      {hasItems && (
        <Button
          variant="ghost"
          size="sm"
          pill
          leftIcon={<TrashIcon size={14} />}
          onClick={onClear}
          className={styles.clearBasketBtn}
          title="Remove all items from basket"
        >
          Clear entire basket
        </Button>
      )}
    </div>
  );
});

interface CartItemsListProps {
  items: CartItem[];
  comparePriceByKey: Map<string, number>;
  totalItems: number;
  currency: string;
  onUpdateQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}

const CartItemsList = memo(function CartItemsList({
  items,
  comparePriceByKey,
  totalItems,
  currency,
  onUpdateQty,
  onRemove,
}: CartItemsListProps) {
  return (
    <div className={styles.itemsCard}>
      <div className={styles.itemsCardHeader}>
        <span className={styles.itemsCardTitle}>Items in your basket</span>
        <span className={styles.itemsCardCount}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      <div className={styles.itemsList}>
        {items.map((item) => (
          <BasketLineItem
            key={item.key}
            keyId={item.key}
            productId={item.productId}
            name={item.name}
            price={item.price}
            comparePrice={comparePriceByKey.get(item.key)}
            qty={item.qty}
            bonusQty={item.bonusQty}
            stock={item.stock}
            variantLabel={item.variantLabel}
            image={item.image}
            currency={item.currency || currency}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
});

interface CartPriceRowProps {
  label: React.ReactNode;
  value: string;
  isDiscount?: boolean;
  strikethrough?: boolean;
  title?: string;
}

const CartPriceRow = memo(function CartPriceRow({
  label,
  value,
  isDiscount = false,
  strikethrough = false,
  title,
}: CartPriceRowProps) {
  return (
    <div className={`${styles.summaryRow} ${isDiscount ? styles.discountRow : ""}`}>
      <span className={styles.summaryLabel} title={title}>
        {label}
      </span>
      <span
        className={`${styles.summaryValue} ${
          strikethrough ? styles.mrpStrikethrough : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
});

interface CartOrderSummaryProps {
  totalItems: number;
  mrpTotal: number;
  totalPrice: number;
  mrpSavings: number;
  discountAmount: number;
  grandTotal: number;
  currency: string;
  appliedOfferLabel: string;
  onProceed: () => void;
  onContinue: () => void;
}

const CartOrderSummary = memo(function CartOrderSummary({
  totalItems,
  mrpTotal,
  totalPrice,
  mrpSavings,
  discountAmount,
  grandTotal,
  currency,
  appliedOfferLabel,
  onProceed,
  onContinue,
}: CartOrderSummaryProps) {
  const hasSavings = mrpSavings > 0 || discountAmount > 0;
  const totalSavings = mrpSavings + discountAmount;

  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryCardHeader}>
        <h2 className={styles.summaryTitle}>Order Summary</h2>
        <span className={styles.summaryItemsCount}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Free Delivery Threshold Progress (Over £40) */}
      <div className={styles.deliveryProgressCard}>
        <div className={styles.deliveryProgressHeader}>
          <TruckIcon size={16} />
          <span>
            {totalPrice >= 40 ? (
              <strong style={{ color: "#166534" }}>You unlocked FREE Delivery!</strong>
            ) : (
              <>
                Add <strong>{formatPrice(40 - totalPrice, currency)}</strong> more for <strong>FREE Delivery</strong>
              </>
            )}
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${Math.min(100, Math.round((totalPrice / 40) * 100))}%` }}
          />
        </div>
        <div className={styles.deliveryProgressThreshold}>
          <span>{formatPrice(totalPrice, currency)}</span>
          <span>Free over {formatPrice(40, currency)}</span>
        </div>
      </div>

      <div className={styles.summaryBreakdown}>
        {mrpSavings > 0 && (
          <CartPriceRow
            label="MRP Total"
            value={formatPrice(mrpTotal, currency)}
            strikethrough
          />
        )}

        <CartPriceRow
          label="Subtotal"
          value={formatPrice(totalPrice, currency)}
        />

        {mrpSavings > 0 && (
          <CartPriceRow
            label={
              <>
                <PriceTagIcon size={13} /> Savings on MRP
              </>
            }
            value={`-${formatPrice(mrpSavings, currency)}`}
            isDiscount
          />
        )}

        {discountAmount > 0 && (
          <CartPriceRow
            label={
              <>
                <PriceTagIcon size={13} /> Discount
              </>
            }
            value={`-${formatPrice(discountAmount, currency)}`}
            isDiscount
            title={appliedOfferLabel}
          />
        )}

        {discountAmount > 0 && appliedOfferLabel && (
          <div className={styles.offerNameRow}>{appliedOfferLabel}</div>
        )}
      </div>

      {hasSavings && (
        <div className={styles.savingsBanner}>
          <SparklesIcon size={18} />
          <span>
            You&apos;re saving <strong>{formatPrice(totalSavings, currency)}</strong> on this order!
          </span>
        </div>
      )}

      <div className={styles.totalRow}>
        <div className={styles.totalLabelGroup}>
          <span className={styles.totalLabel}>Estimated Total</span>
          <span className={styles.vatNote}>Taxes & delivery calculated at checkout</span>
        </div>
        <span className={styles.totalPrice}>{formatPrice(grandTotal, currency)}</span>
      </div>

      <div className={styles.actionButtons}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          pill
          rightIcon={<ArrowRightIcon size={18} />}
          onClick={onProceed}
          id="cart-proceed-checkout-btn"
        >
          Proceed to Checkout
        </Button>

        <Button
          variant="outline"
          size="md"
          fullWidth
          pill
          leftIcon={<ArrowLeftIcon size={16} />}
          onClick={onContinue}
          id="cart-continue-shopping-btn"
        >
          Continue Shopping
        </Button>
      </div>

      <div className={styles.secureCheckoutNote}>
        <LockIcon size={14} />
        <span>256-bit secure checkout</span>
      </div>
    </div>
  );
});

interface CartEmptyStateProps {
  onStartShopping: () => void;
}

const CartEmptyState = memo(function CartEmptyState({
  onStartShopping,
}: CartEmptyStateProps) {
  return (
    <div className={styles.emptyCard}>
      <div className={styles.emptyIconCircle}>
        <CartIcon size={38} />
      </div>
      <h2 className={styles.emptyTitle}>Your basket is empty</h2>
      <p className={styles.emptyDescription}>
        Looks like you haven&apos;t added any items to your basket yet. Discover our fresh groceries and gourmet foods.
      </p>
      <Button
        variant="primary"
        size="lg"
        pill
        rightIcon={<ArrowRightIcon size={18} />}
        onClick={onStartShopping}
        id="cart-start-shopping-btn"
      >
        Start Shopping
      </Button>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Main Cart Content Component                                                */
/* -------------------------------------------------------------------------- */

function CartContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    hydrated,
    loadCart,
    updateQty,
    removeItem,
    clear,
    couponCode,
    couponResult,
    evaluateOffers,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [itemLevelOffers, setItemLevelOffers] = useState<Coupon[]>([]);
  const hasLoadedRef = useRef(false);

  // Stable event handlers with useCallback
  const handleUpdateQty = useCallback(
    (key: string, qty: number) => {
      updateQty(key, qty);
    },
    [updateQty]
  );

  const handleRemoveItem = useCallback(
    (key: string) => {
      removeItem(key);
    },
    [removeItem]
  );

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  const handleProceed = useCallback(() => {
    router.push("/checkout");
  }, [router]);

  const handleContinue = useCallback(() => {
    router.push("/products");
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCart();
    }
  }, [isAuthenticated, loadCart]);

  // Re-evaluate offers when cart items change
  useEffect(() => {
    if (items.length > 0 && isAuthenticated) {
      void evaluateOffers();
    }
  }, [items, isAuthenticated, evaluateOffers]);

  // Per-product auto-offers (for "was" MRP display)
  const domainIdsKey = useMemo(
    () => [...new Set(items.map((i) => i.domainId))].sort().join(","),
    [items]
  );

  useEffect(() => {
    const domainIds = domainIdsKey ? domainIdsKey.split(",") : [];
    if (domainIds.length === 0) {
      setItemLevelOffers([]);
      return;
    }
    let isCancelled = false;
    Promise.all(domainIds.map((domainId) => offersService.listActive(domainId).catch(() => [])))
      .then((byDomain) => {
        if (!isCancelled) {
          setItemLevelOffers(byDomain.flat());
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setItemLevelOffers([]);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [domainIdsKey]);

  const currency = items[0]?.currency || "GBP";
  const discountAmount = couponResult?.valid ? couponResult.discountAmount : 0;
  const grandTotal = Math.max(0, totalPrice - discountAmount);

  // Only display full-page skeleton on initial mount when no data is loaded yet
  const isInitialLoading = !mounted || (!hydrated && items.length === 0) || (loading && items.length === 0);

  // Per-item "was" price memoization
  const comparePriceByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const itemOffer = findBestItemOffer(itemLevelOffers, {
        productId: item.productId,
        variantId: item.variantId,
        domainId: item.domainId,
        unitPrice: item.price,
      });
      const comparePrice =
        item.mrp && item.mrp > item.price
          ? item.mrp
          : itemOffer
            ? estimateItemComparePrice(item.price, itemOffer)
            : undefined;
      if (comparePrice) map.set(item.key, comparePrice);
    }
    return map;
  }, [items, itemLevelOffers]);

  const mrpTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (comparePriceByKey.get(item.key) ?? item.price) * item.qty,
        0
      ),
    [items, comparePriceByKey]
  );

  const mrpSavings = useMemo(() => Math.max(0, mrpTotal - totalPrice), [mrpTotal, totalPrice]);

  const appliedOfferLabel = useMemo(() => {
    if (!couponResult?.valid) return "";
    if (couponCode && couponCode !== "AUTO_OFFER") return couponCode;
    return couponResult.coupon?.description ?? "";
  }, [couponResult, couponCode]);

  return (
    <StoreLayout>
      <Container>
        <div className={styles.container}>
          <CartHeader
            totalItems={totalItems}
            hasItems={!isInitialLoading && items.length > 0}
            onClear={handleClear}
          />

          {isInitialLoading ? (
            <CartLoadingSkeleton />
          ) : items.length === 0 ? (
            <CartEmptyState onStartShopping={handleContinue} />
          ) : (
            <div className={styles.layout}>
              <CartItemsList
                items={items}
                comparePriceByKey={comparePriceByKey}
                totalItems={totalItems}
                currency={currency}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemoveItem}
              />

              <CartOrderSummary
                totalItems={totalItems}
                mrpTotal={mrpTotal}
                totalPrice={totalPrice}
                mrpSavings={mrpSavings}
                discountAmount={discountAmount}
                grandTotal={grandTotal}
                currency={currency}
                appliedOfferLabel={appliedOfferLabel}
                onProceed={handleProceed}
                onContinue={handleContinue}
              />
            </div>
          )}
        </div>
      </Container>
    </StoreLayout>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <StoreLayout>
          <Container>
            <CartLoadingSkeleton />
          </Container>
        </StoreLayout>
      }
    >
      <CartContent />
    </Suspense>
  );
}

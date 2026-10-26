"use client";

import { useEffect, useMemo, useState, useRef, Suspense, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  ShieldCheckIcon,
  DiamondIcon,
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
        <Skeleton width="100%" height="52px" style={{ borderRadius: "6px", marginTop: "12px" }} />
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
        <h1 className={styles.title}>Your Cart</h1>
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
          title="Remove all items from cart"
        >
          Clear entire cart
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
    <div className={styles.leftColumn}>
      <div className={styles.itemsCard}>
        <div className={styles.itemsCardHeader}>
          <span className={styles.itemsCardTitle}>Items in your cart</span>
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
              variantLabel={item.variantLabel}
              image={item.image}
              currency={currency}
              onUpdateQty={onUpdateQty}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>

      {/* TRUST BENEFITS STRIP BENEATH ITEMS */}
      <div className={styles.cartTrustRow}>
        <div className={styles.cartTrustItem}>
          <TruckIcon size={20} className={styles.cartTrustIcon} />
          <div>
            <span className={styles.cartTrustTitle}>Free Shipping</span>
            <span className={styles.cartTrustSub}>On orders above £2,999</span>
          </div>
        </div>
        <div className={styles.cartTrustItem}>
          <ShieldCheckIcon size={20} className={styles.cartTrustIcon} />
          <div>
            <span className={styles.cartTrustTitle}>Secure Payments</span>
            <span className={styles.cartTrustSub}>100% Safe &amp; Encrypted</span>
          </div>
        </div>
      </div>

      {/* STILL DECIDING? SAVE CART CARD */}
      <div className={styles.stillDecidingCard}>
        <div className={styles.stillDecidingContent}>
          <span className={styles.stillDecidingEyebrow}>LUXURY GIFTING</span>
          <h3 className={styles.stillDecidingTitle}>Still Deciding? Save your cart for later</h3>
          <p className={styles.stillDecidingSub}>
            Take your time. We hold your bespoke selections so you never lose your dream piece.
          </p>
        </div>
        <div className={styles.stillDecidingAction}>
          <DiamondIcon size={36} color="#A77B3F" />
        </div>
      </div>
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

const CartPriceRow = memo(function CartPriceRow({
  label,
  value,
  isDiscount = false,
  title,
}: {
  label: React.ReactNode;
  value: string;
  isDiscount?: boolean;
  title?: string;
}) {
  return (
    <div className={`${styles.priceBreakdownRow} ${isDiscount ? styles.discountRow : ""}`} title={title}>
      <span className={styles.priceBreakdownLabel}>{label}</span>
      <span className={styles.priceBreakdownValue}>{value}</span>
    </div>
  );
});

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
  const totalSavings = mrpSavings + discountAmount;
  const hasSavings = totalSavings > 0;

  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryCardHeader}>
        <h2 className={styles.summaryCardTitle}>Order Summary</h2>
        <span className={styles.summaryItemCount}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      <div className={styles.priceBreakdown}>
        {mrpTotal > totalPrice && (
          <CartPriceRow
            label="Original Value"
            value={formatPrice(mrpTotal, currency)}
          />
        )}

        <CartPriceRow
          label="Subtotal"
          value={formatPrice(totalPrice, currency)}
        />

        <CartPriceRow
          label="Shipping"
          value="FREE"
        />

        {mrpSavings > 0 && (
          <CartPriceRow
            label={
              <>
                <PriceTagIcon size={13} /> Promotional Savings
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
                <PriceTagIcon size={13} /> Applied Coupon
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
          <SparklesIcon size={16} />
          <span>
            You&apos;re saving <strong>{formatPrice(totalSavings, currency)}</strong> on this order!
          </span>
        </div>
      )}

      <div className={styles.totalRow}>
        <div className={styles.totalLabelGroup}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.vatNote}>Includes all applicable taxes</span>
        </div>
        <span className={styles.totalPrice}>{formatPrice(grandTotal, currency)}</span>
      </div>

      <div className={styles.actionButtons}>
        <button
          type="button"
          className={styles.proceedCheckoutBtn}
          onClick={onProceed}
          id="cart-proceed-checkout-btn"
        >
          <span>Proceed to Checkout</span>
          <ArrowRightIcon size={16} />
        </button>

        <button
          type="button"
          className={styles.continueShoppingBtn}
          onClick={onContinue}
          id="cart-continue-shopping-btn"
        >
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className={styles.secureCheckoutNote}>
        <LockIcon size={14} />
        <span>256-bit SSL encrypted secure checkout</span>
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
        <DiamondIcon size={38} />
      </div>
      <h2 className={styles.emptyTitle}>Your cart is currently empty</h2>
      <p className={styles.emptyDescription}>
        Discover our exquisite handcrafted diamond and gold jewellery collections and find your next cherished piece.
      </p>
      <button
        type="button"
        className={styles.proceedCheckoutBtn}
        style={{ width: "auto", padding: "0 32px" }}
        onClick={onStartShopping}
        id="cart-start-shopping-btn"
      >
        <span>Explore Collections</span>
        <ArrowRightIcon size={16} />
      </button>
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

  useEffect(() => {
    if (items.length > 0 && isAuthenticated) {
      void evaluateOffers();
    }
  }, [items, isAuthenticated, evaluateOffers]);

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

  const isInitialLoading = !mounted || (!hydrated && items.length === 0) || (loading && items.length === 0);

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

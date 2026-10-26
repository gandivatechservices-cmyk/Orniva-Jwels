"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ProtectedRoute } from "../../guards";
import { IMAGES } from "../../constants/images";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { CouponInput, UkAddressAutocomplete } from "../../components/common";
import {
  CreditCardIcon,
  LockIcon,
  MapPinIcon,
  TruckIcon,
  ArrowLeftIcon,
  CheckIcon,
  ShieldCheckIcon,
  PriceTagIcon,
  SparklesIcon,
  ChevronDownIcon,
  CopyIcon,
  InfoIcon,
} from "../../components/icons";
import { useAuth, useCart } from "hooks";
import {
  cartService,
  ordersService,
  paymentsService,
  offersService,
  settingsService,
  isValidUkPostcodeFormat,
  type OfferEligibility,
  type UkAddressResult,
  type DeliverySettings,
} from "../../utility/services";
import { formatPrice } from "../../utility/formatMoney";
import styles from "./checkout.module.css";

const addressSchema = Yup.object().shape({
  line1: Yup.string().required("Street address is required"),
  line2: Yup.string().optional(),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("County / Region is required"),
  postalCode: Yup.string()
    .required("Postcode is required")
    .test("is-uk-postcode", "Please enter a valid UK postcode (e.g. SW1A 1AA)", (val) => {
      if (!val) return false;
      return isValidUkPostcodeFormat(val);
    }),
  country: Yup.string().required("Country is required"),
  phone: Yup.string().required("Mobile phone number is required"),
  deliveryNotes: Yup.string().optional(),
});

function fallbackCopyText(text: string) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  } catch {
    // ignore
  }
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clear, couponCode, couponResult, applyCoupon, removeCoupon, couponLoading } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [offerEligibility, setOfferEligibility] = useState<OfferEligibility[]>([]);
  const [showIneligibleOffers, setShowIneligibleOffers] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);

  useEffect(() => {
    settingsService
      .getDeliverySettings()
      .then(setDeliverySettings)
      .catch(() => {});
  }, []);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {
        fallbackCopyText(code);
      });
    } else {
      fallbackCopyText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2000);
  };

  useEffect(() => {
    if (items.length === 0) {
      const timer = window.setTimeout(() => setOfferEligibility([]), 0);
      return () => window.clearTimeout(timer);
    }
    offersService
      .checkEligibility({
        domainId: items[0].domainId,
        cartLines: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || item.productId,
          quantity: item.qty,
        })),
      })
      .then(setOfferEligibility)
      .catch(() => setOfferEligibility([]));
  }, [items]);

  const currency = items[0]?.currency || "GBP";
  const discountAmount = couponResult?.valid ? couponResult.discountAmount : 0;
  const freeDeliveryFromCoupon = couponResult?.valid ? couponResult.freeDelivery : false;
  const freeDeliveryThreshold = deliverySettings?.freeDeliveryThreshold ?? 40;
  const standardDeliveryFee = deliverySettings?.standardDeliveryFee ?? 4;
  const isFreeDelivery = totalPrice >= freeDeliveryThreshold || freeDeliveryFromCoupon;
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;
  const grandTotal = Math.max(0, totalPrice - discountAmount) + deliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalPrice);
  const appliedCouponCode = couponResult?.valid ? couponCode ?? undefined : undefined;
  const appliedOfferLabel = (() => {
    if (!couponResult?.valid) return "";
    if (couponCode && couponCode !== "AUTO_OFFER") return couponCode;
    return couponResult.coupon?.description ?? "";
  })();
  const mrpTotal = items.reduce((sum, item) => sum + (item.mrp && item.mrp > item.price ? item.mrp : item.price) * item.qty, 0);
  const mrpSavings = Math.max(0, mrpTotal - totalPrice);

  const userAddress = user?.addresses?.[0];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      line1: userAddress?.line1 || "",
      line2: userAddress?.line2 || "",
      city: userAddress?.city || "",
      state: userAddress?.state || "",
      postalCode: userAddress?.postalCode || "",
      country: "United Kingdom",
      phone: userAddress?.phone || "",
      deliveryNotes: "",
    },
    validationSchema: addressSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setServerError(null);
      try {
        // Reconcile backend cart with current basket
        const backendCart = await cartService.getCart();
        const backendByVariant = new Map(backendCart.items.map((item) => [item.variantId, item]));
        const localVariantIds = new Set(items.filter((item) => item.variantId).map((item) => item.variantId));

        await Promise.all(
          backendCart.items
            .filter((item) => !localVariantIds.has(item.variantId))
            .map((item) => cartService.removeItem(item.variantId))
        );

        for (const item of items) {
          if (!item.variantId) continue;
          const existing = backendByVariant.get(item.variantId);
          if (!existing) {
            await cartService.addItem({ productId: item.productId, variantId: item.variantId, quantity: item.qty });
          } else if (existing.quantity !== item.qty) {
            await cartService.updateItem(item.variantId, item.qty);
          }
        }

        const order = await ordersService.create(
          {
            line1: values.line1,
            line2: values.line2 || undefined,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country || undefined,
            phone: values.phone || undefined,
          },
          appliedCouponCode,
          "card"
        );

        const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
        const { url } = await paymentsService.createCheckoutSession(order._id, clientOrigin);
        if (!url) {
          throw new Error("Payment gateway did not return a checkout link. Please try again.");
        }
        // Cart is kept intact until payment is confirmed on Stripe.
        // If the customer backs out or cancels, items remain safe in the basket.
        window.location.href = url;
      } catch (err: unknown) {
        setServerError(
          err instanceof Error
            ? err.message
            : "Something went wrong while placing your order. Please try again."
        );
        setSubmitting(false);
      }
    },
  });

  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  const handleSelectAddress = (addr: UkAddressResult) => {
    formik.setValues({
      ...formik.values,
      line1: addr.line1 || addr.displayName,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.county || addr.city,
      postalCode: addr.postalCode,
      country: addr.country || "United Kingdom",
    });
    formik.setFieldTouched("line1", true, false);
    formik.setFieldTouched("city", true, false);
    formik.setFieldTouched("state", true, false);
    formik.setFieldTouched("postalCode", true, false);
    formik.setFieldTouched("country", true, false);
    setAutoFilledNotice(`Auto-filled: ${addr.line1 || addr.displayName}, ${addr.city} (${addr.postalCode})`);
  };

  if (items.length === 0) {
    return (
      <StoreLayout>
        <Container>
          <div style={{ padding: "80px 0" }}>
            <EmptyState
              title="Your basket is empty"
              description="Please add items to your basket before proceeding to checkout."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  pill
                  onClick={() => router.push("/products")}
                  id="checkout-empty-shop-btn"
                >
                  Start Shopping
                </Button>
              }
            />
          </div>
        </Container>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <Container>
        <div className={styles.container}>
          {/* Top navigation row */}
          <div className={styles.topNav}>
            <Link href="/cart" className={styles.backLink}>
              <ArrowLeftIcon size={16} />
              <span>Back to Basket</span>
            </Link>
          </div>

          <div className={styles.headingRow}>
            <h1 className={styles.title}>Express Checkout</h1>
            <p className={styles.subtitle}>
              Review your delivery details and choose your preferred payment method.
            </p>
          </div>

          {serverError && <div className={styles.errorBanner}>{serverError}</div>}

          <form onSubmit={formik.handleSubmit} className={styles.layout}>
            <div className={styles.formSections}>
              {/* 1. DELIVERY ADDRESS */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.stepNumber}>1</div>
                    <div>
                      <h2 className={styles.cardTitle}>Delivery Address</h2>
                      <span className={styles.cardSubtitle}>Where should we send your groceries?</span>
                    </div>
                  </div>
                  <MapPinIcon size={20} style={{ color: "var(--color-primary, #A77B3F)" }} />
                </div>

                {/* Saved addresses selector */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className={styles.savedAddressesSection}>
                    <span className={styles.savedAddressHeader}>Saved Addresses</span>
                    <div className={styles.savedAddressChips}>
                      {user.addresses.map((addr, idx) => {
                        const isSelected =
                          formik.values.line1 === addr.line1 &&
                          formik.values.postalCode === addr.postalCode;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`${styles.addressChip} ${isSelected ? styles.selected : ""}`}
                            onClick={() => {
                              formik.setValues({
                                ...formik.values,
                                line1: addr.line1,
                                line2: addr.line2 || "",
                                city: addr.city,
                                state: addr.state,
                                postalCode: addr.postalCode,
                                country: addr.country || "United Kingdom",
                                phone: addr.phone || formik.values.phone,
                              });
                              formik.setFieldTouched("line1", true, false);
                              formik.setFieldTouched("city", true, false);
                              formik.setFieldTouched("state", true, false);
                              formik.setFieldTouched("postalCode", true, false);
                              setAutoFilledNotice(null);
                            }}
                          >
                            <MapPinIcon size={14} />
                            <span>{addr.line1}, {addr.city}</span>
                            {isSelected && <CheckIcon size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* UK Address Autocomplete Lookup */}
                <div className={styles.autocompleteSection}>
                  <div className={styles.autocompleteHeader}>
                    <label className={styles.label} htmlFor="address-lookup">
                      <span>Search UK Delivery Address or Postcode</span>
                    </label>
                    <span className={styles.autocompleteHint}>
                      Search your street, postcode or town to auto-fill address details below
                    </span>
                  </div>
                  <UkAddressAutocomplete
                    id="address-lookup"
                    onSelectAddress={handleSelectAddress}
                  />
                  {autoFilledNotice && (
                    <div className={styles.autofillNotice}>
                      <CheckIcon size={14} />
                      <span>{autoFilledNotice}</span>
                    </div>
                  )}
                </div>

                <div className={styles.addressFormDivider}>
                  <span>Address Details</span>
                </div>

                {/* Address Input Fields (Always visible, editable, and auto-filled by search) */}
                <div className={styles.formGrid}>
                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="line1">
                      Street Address *
                    </label>
                    <input
                      id="line1"
                      name="line1"
                      type="text"
                      placeholder="e.g. 12 High Street"
                      className={`${styles.input} ${formik.touched.line1 && formik.errors.line1 ? styles.inputError : ""
                        }`}
                      value={formik.values.line1}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.line1 && formik.errors.line1 && (
                      <span className={styles.errorText}>{formik.errors.line1}</span>
                    )}
                  </div>

                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="line2">
                      Apartment, Flat or Suite (optional)
                    </label>
                    <input
                      id="line2"
                      name="line2"
                      type="text"
                      placeholder="e.g. Flat 4B"
                      className={styles.input}
                      value={formik.values.line2}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="city">
                      Town / City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="e.g. London"
                      className={`${styles.input} ${formik.touched.city && formik.errors.city ? styles.inputError : ""
                        }`}
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.city && formik.errors.city && (
                      <span className={styles.errorText}>{formik.errors.city}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="state">
                      County / Region *
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="e.g. Greater London"
                      className={`${styles.input} ${formik.touched.state && formik.errors.state ? styles.inputError : ""
                        }`}
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.state && formik.errors.state && (
                      <span className={styles.errorText}>{formik.errors.state}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="postalCode">
                      Postcode *
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="e.g. SW1A 1AA"
                      className={`${styles.input} ${formik.touched.postalCode && formik.errors.postalCode ? styles.inputError : ""
                        }`}
                      value={formik.values.postalCode}
                      onChange={(e) => {
                        formik.setFieldValue("postalCode", e.target.value.toUpperCase());
                      }}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.postalCode && formik.errors.postalCode && (
                      <span className={styles.errorText}>{formik.errors.postalCode}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="country">
                      <span>Country *</span>
                    </label>
                    <div className={styles.readOnlyInputWrapper}>
                      <span className={styles.countryFlag} aria-hidden="true">🇬🇧</span>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                        className={`${styles.input} ${styles.inputReadOnly}`}
                        value="United Kingdom"
                      />
                    </div>
                  </div>

                  <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="phone">
                      Mobile Phone (for delivery SMS) *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. +44 7700 900077"
                      className={`${styles.input} ${formik.touched.phone && formik.errors.phone ? styles.inputError : ""
                        }`}
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <span className={styles.errorText}>{formik.errors.phone}</span>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. DELIVERY SPEED & INSTRUCTIONS */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.stepNumber}>2</div>
                    <div>
                      <h2 className={styles.cardTitle}>Delivery Option</h2>
                      <span className={styles.cardSubtitle}>Fresh, direct delivery to your door</span>
                    </div>
                  </div>
                  <TruckIcon size={20} style={{ color: "var(--color-primary, #A77B3F)" }} />
                </div>

                <div className={styles.deliveryBox}>
                  <div className={styles.deliveryInfo}>
                    <div className={styles.deliveryIconWrapper}>
                      <TruckIcon size={22} />
                    </div>
                    <div className={styles.deliveryText}>
                      <span className={styles.deliveryTitle}>Standard Courier Delivery</span>
                      <span className={styles.deliveryDescription}>
                        Delivered within 2–3 business days with real-time SMS tracking
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${styles.deliveryBadge} ${isFreeDelivery ? styles.free : styles.standard
                      }`}
                  >
                    {isFreeDelivery ? "FREE DELIVERY" : formatPrice(deliveryFee, currency)}
                  </span>
                </div>

                {!isFreeDelivery && amountNeededForFreeDelivery > 0 && (
                  <div className={styles.freeDeliveryHint}>
                    <SparklesIcon size={14} />
                    <span>
                      Add <strong>{formatPrice(amountNeededForFreeDelivery, currency)}</strong> more to qualify for <strong>FREE Delivery</strong> (orders over {formatPrice(freeDeliveryThreshold, currency)})
                    </span>
                  </div>
                )}

                <div className={`${styles.fieldGroup} ${styles.instructionsField}`}>
                  <label className={styles.label} htmlFor="deliveryNotes">
                    Special Delivery Instructions (optional)
                  </label>
                  <input
                    id="deliveryNotes"
                    name="deliveryNotes"
                    type="text"
                    placeholder="e.g. Leave with neighbor at No. 14 or ring top buzzer"
                    className={styles.input}
                    value={formik.values.deliveryNotes}
                    onChange={formik.handleChange}
                  />
                </div>
              </section>

              {/* 3. PAYMENT METHOD */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.stepNumber}>3</div>
                    <div>
                      <h2 className={styles.cardTitle}>Payment Method</h2>
                      <span className={styles.cardSubtitle}>All orders are processed via secure online checkout</span>
                    </div>
                  </div>
                  <LockIcon size={18} style={{ color: "var(--color-primary, #A77B3F)" }} />
                </div>

                <div className={styles.onlinePaymentBox}>
                  <div className={styles.onlinePaymentHeader}>
                    <div className={styles.onlinePaymentTitleGroup}>
                      <div className={styles.onlinePaymentBadge}>
                        <ShieldCheckIcon size={18} style={{ color: "var(--color-primary, #A77B3F)" }} />
                        <span>Online Card & Digital Wallet</span>
                      </div>
                      <span className={styles.onlinePaymentSubtitle}>
                        Instant 256-bit encrypted checkout powered by Stripe
                      </span>
                    </div>
                    <CreditCardIcon size={24} className={styles.paymentIcon} />
                  </div>

                  <p className={styles.onlinePaymentDesc}>
                    We accept Visa, Mastercard, American Express, Apple Pay, and Google Pay. You will be redirected to complete your payment securely.
                  </p>

                  <div className={styles.paymentBadges}>
                    <span className={styles.paymentPill}>Stripe Secure</span>
                    <span className={styles.paymentPill}>Visa</span>
                    <span className={styles.paymentPill}>Mastercard</span>
                    <span className={styles.paymentPill}>American Express</span>
                    <span className={styles.paymentPill}>Apple Pay</span>
                    <span className={styles.paymentPill}>Google Pay</span>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT SIDE: ORDER SUMMARY */}
            <aside className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                <span className={styles.summaryItemCount}>
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items list with thumbnails */}
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.key} className={styles.summaryItem}>
                    <div className={styles.itemImageWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image && item.image.trim() !== "" ? item.image : IMAGES.placeholders.product}
                        alt={item.name}
                        className={styles.itemImage}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = IMAGES.placeholders.product;
                        }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName} title={item.name}>
                        {item.name}
                      </span>
                      <div className={styles.itemMeta}>
                        {item.variantLabel && <span>{item.variantLabel} •</span>}
                        <span>Qty: {item.qty}</span>
                      </div>
                    </div>
                    <div className={styles.itemPriceCol}>
                      {item.mrp && item.mrp > item.price && (
                        <span className={styles.itemMrp}>{formatPrice(item.mrp * item.qty, currency)}</span>
                      )}
                      <span className={styles.itemPrice}>
                        {formatPrice(item.price * item.qty, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code input */}
              <CouponInput />

              {offerEligibility.length > 0 && (() => {
                const appliedOffer = offerEligibility.find(
                  (o) => couponResult?.valid && couponResult.coupon?._id === o.couponId
                );
                const otherOffers = offerEligibility
                  .filter((o) => o.couponId !== appliedOffer?.couponId)
                  .sort((a, b) => Number(b.eligible) - Number(a.eligible));

                const appliedCode = appliedOffer?.code || (couponResult?.valid && couponCode !== "AUTO_OFFER" ? couponCode : undefined);

                const badgeFor = (offer: OfferEligibility) => {
                  if (offer.discountType === "percent") return `${offer.discountValue}% OFF`;
                  if (offer.discountType === "fixed") return `${formatPrice(offer.discountValue || 0, currency)} OFF`;
                  if (offer.discountType === "free_shipping") return "FREE DELIVERY";
                  if (offer.discountType === "buy_x_get_y") return "BUY & GET DEAL";
                  return "SPECIAL DEAL";
                };

                return (
                  <div className={styles.offersEligibility}>
                    <div className={styles.offersEligibilityHeader}>
                      <div className={styles.offersTitleGroup}>
                        <PriceTagIcon size={15} className={styles.offersHeaderIcon} />
                        <span className={styles.offersEligibilityTitle}>Available Offers & Discounts</span>
                      </div>
                      <span className={styles.offersCountBadge}>
                        {offerEligibility.length} {offerEligibility.length === 1 ? "Deal" : "Deals"}
                      </span>
                    </div>

                    {/* CURRENTLY APPLIED OFFER */}
                    {appliedOffer ? (
                      <div className={`${styles.offerCard} ${styles.offerCardApplied}`}>
                        <div className={styles.offerCardTop}>
                          <span className={styles.offerBadgeTag}>{badgeFor(appliedOffer)}</span>
                          <span className={styles.appliedBadge}>
                            <CheckIcon size={12} /> Applied
                          </span>
                        </div>

                        <div className={styles.offerDescriptionText}>
                          {appliedOffer.description.replace(/₹/g, "£")}
                        </div>

                        <div className={styles.offerCardFooter}>
                          {appliedCode && (
                            <div className={styles.codePillWrap}>
                              <span className={styles.activeCodePill}>
                                <PriceTagIcon size={12} />
                                <span>{appliedCode}</span>
                              </span>
                              <button
                                type="button"
                                className={styles.removeOfferBtn}
                                onClick={() => void removeCoupon()}
                                title="Remove applied discount"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          {appliedOffer.discountAmount !== undefined && appliedOffer.discountAmount > 0 && (
                            <span className={styles.savingsPill}>
                              ✓ Saves {formatPrice(appliedOffer.discountAmount, currency)} on this order
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noOfferPrompt}>
                        <span>Select an offer below or enter your promo code to apply savings.</span>
                      </div>
                    )}

                    {/* OTHER OFFERS LIST */}
                    {otherOffers.length > 0 && (
                      <div className={styles.otherOffersSection}>
                        <button
                          type="button"
                          className={styles.offersToggle}
                          onClick={() => setShowIneligibleOffers((v) => !v)}
                          aria-expanded={showIneligibleOffers}
                        >
                          <span className={styles.offersToggleText}>
                            {showIneligibleOffers
                              ? "Hide available offers"
                              : `View ${otherOffers.length} more ${otherOffers.length === 1 ? "offer" : "offers"}`}
                          </span>
                          <ChevronDownIcon
                            size={14}
                            className={`${styles.toggleChevron} ${showIneligibleOffers ? styles.rotated : ""}`}
                          />
                        </button>

                        {showIneligibleOffers && (
                          <div className={styles.offersList}>
                            {otherOffers.map((offer) => {
                              const canApply = offer.eligible && Boolean(offer.code);

                              return (
                                <div
                                  key={offer.couponId}
                                  className={`${styles.offerCard} ${
                                    offer.eligible ? styles.offerCardEligible : styles.offerCardIneligible
                                  }`}
                                >
                                  {/* Top row: Discount badge + Apply/Ineligible button */}
                                  <div className={styles.offerCardTop}>
                                    <span className={styles.offerBadgeTag}>{badgeFor(offer)}</span>
                                    {canApply ? (
                                      <button
                                        type="button"
                                        className={styles.applyOfferBtn}
                                        onClick={() => void applyCoupon(offer.code!)}
                                        disabled={couponLoading}
                                        aria-label={`Apply code ${offer.code}`}
                                      >
                                        Apply
                                      </button>
                                    ) : !offer.eligible ? (
                                      <span className={styles.lockedBadge}>
                                        <LockIcon size={10} /> Ineligible
                                      </span>
                                    ) : null}
                                  </div>

                                  {/* Middle row: Offer description */}
                                  <div className={styles.offerDescriptionText}>
                                    {offer.description.replace(/₹/g, "£")}
                                  </div>

                                  {/* Savings note if eligible */}
                                  {offer.eligible && offer.discountAmount !== undefined && offer.discountAmount > 0 && (
                                    <div className={styles.savingsPill}>
                                      ✓ Save up to {formatPrice(offer.discountAmount, currency)}
                                    </div>
                                  )}

                                  {/* Coupon Code Pill with Copy button */}
                                  {offer.code && (
                                    <div className={styles.couponCodeRow}>
                                      <div
                                        className={styles.couponCodePill}
                                        onClick={(e) => handleCopyCode(e, offer.code!)}
                                        role="button"
                                        tabIndex={0}
                                        title="Click to copy promo code"
                                      >
                                        <span className={styles.couponCodeLabel}>CODE:</span>
                                        <strong className={styles.couponCodeValue}>{offer.code}</strong>
                                        <span className={styles.copyPillBtn}>
                                          {copiedCode === offer.code ? (
                                            <span className={styles.copiedState}>
                                              <CheckIcon size={12} /> Copied!
                                            </span>
                                          ) : (
                                            <span className={styles.copyState}>
                                              <CopyIcon size={12} /> Copy
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* How to qualify hint for locked/ineligible offers */}
                                  {!offer.eligible && offer.howToQualify && (
                                    <div className={styles.howToQualifyHint}>
                                      <InfoIcon size={12} className={styles.infoIcon} />
                                      <span>{offer.howToQualify.replace(/₹/g, "£")}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Summary Totals Breakdown */}
              <div className={styles.summaryTotals}>
                {mrpSavings > 0 && (
                  <div className={styles.summaryRow}>
                    <span>MRP Total</span>
                    <span className={styles.itemMrp}>{formatPrice(mrpTotal, currency)}</span>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span style={{ color: "#242321", fontWeight: 600 }}>
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>

                {mrpSavings > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span className={styles.discountLabel}>
                      <PriceTagIcon size={13} /> Savings on MRP
                    </span>
                    <span>-{formatPrice(mrpSavings, currency)}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span className={styles.discountLabel}>
                      <PriceTagIcon size={13} /> Discount
                    </span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                {discountAmount > 0 && appliedOfferLabel && (
                  <div className={styles.offerNameRow}>{appliedOfferLabel}</div>
                )}

                {(mrpSavings > 0 || discountAmount > 0) && (
                  <div className={styles.savingsBanner}>
                    <SparklesIcon size={18} />
                    <span>
                      You&apos;re saving <strong>{formatPrice(mrpSavings + discountAmount, currency)}</strong> on this
                      order!
                    </span>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span>
                    {isFreeDelivery ? (
                      <strong style={{ color: "var(--color-primary, #A77B3F)" }}>FREE</strong>
                    ) : (
                      formatPrice(deliveryFee, currency)
                    )}
                  </span>
                </div>

                <div className={styles.totalRow}>
                  <div className={styles.totalLabelGroup}>
                    <span className={styles.totalLabel}>Estimated Total</span>
                    <span className={styles.vatNote}>Includes all taxes & packaging</span>
                  </div>
                  <span className={styles.totalPrice}>{formatPrice(grandTotal, currency)}</span>
                </div>

                {/* Common Button Component */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  pill
                  isLoading={submitting}
                  leftIcon={<LockIcon size={16} />}
                  id="checkout-place-order-btn"
                >
                  Pay Securely • {formatPrice(grandTotal, currency)}
                </Button>

                <div className={styles.secureCheckoutNote}>
                  <ShieldCheckIcon size={14} style={{ color: "var(--color-primary, #A77B3F)" }} />
                  <span>256-bit secure SSL checkout guaranteed</span>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </Container>
    </StoreLayout>
  );
}

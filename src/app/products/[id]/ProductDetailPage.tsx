"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StoreLayout } from "../../../components/StoreLayout";
import { Container } from "../../../components/layout/Container";
import { Breadcrumb } from "../../../components/ui/Breadcrumb";
import { Rating } from "../../../components/ui/Rating";
import { Tabs } from "../../../components/ui/Tabs";
import { ProductCard, ProductImageLightbox } from "../../../components/common";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { getApplicableOffers, getMrpComparePrice, getVisibleOffers, offerShortLabel } from "../../../utility/activeOffers";
import {
  ArrowRightIcon,
  CheckIcon,
  ExpandIcon,
  HeartIcon,
  DiamondIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  TruckIcon,
  ShoppingBagIcon,
} from "../../../components/icons";
import {
  catalogService,
  offersService,
  reviewsService,
  type Category,
  type Coupon,
  type Domain,
  type Product,
  type Variant,
} from "../../../utility/services";
import { useAuth, useCart, useWishlist, useProductCart, useCartQuantity } from "hooks";
import { formatPrice } from "../../../utility/formatMoney";
import { IMAGES, getGroceryProductImage } from "../../../constants/images";
import { ProductReviews } from "./ProductReviews";
import styles from "./product.module.css";

function formatLabel(value: string) {
  const spaced = value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return spaced.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function getProductWeight(p: Product): string {
  if (p.attributes?.weight) return p.attributes.weight;
  if (p.attributes?.unit) return p.attributes.unit;
  if (p.attributes?.packSize) return p.attributes.packSize;
  const nameLower = (p.name || "").toLowerCase();
  if (nameLower.includes("almond") || nameLower.includes("cashew") || nameLower.includes("trail")) return "250g";
  if (nameLower.includes("chip")) return "150g";
  if (nameLower.includes("banana")) return "1 kg";
  if (nameLower.includes("apple")) return "6 pack";
  if (nameLower.includes("tomato")) return "500g";
  if (nameLower.includes("milk")) return "1 Litre";
  return "Pack";
}

import { formatUnit, uniqueVariantLabels } from "utility/variantLabels";
import { VariantSelector, canGroupVariants } from "./VariantSelector";
import { LOW_STOCK_THRESHOLD, variantCardProps } from "utility/variantPricing";

function formatVariantOptionLabel(v: Variant, index: number): string {
  if (v.attributes?.weight) {
    return v.attributes.unit ? `${v.attributes.weight} · ${formatUnit(v.attributes.unit)}` : v.attributes.weight;
  }
  if (v.attributes?.size) return v.attributes.size;
  if (v.attributes?.packSize) return v.attributes.packSize;
  if (v.attributes && Object.keys(v.attributes).length > 0) {
    return Object.entries(v.attributes).map(([key, value]) => (key === "unit" ? formatUnit(value) : value)).join(" / ");
  }

  // No attributes to describe this option — fall back to its name, then the SKU.
  if (v.name?.trim()) return v.name.trim();

  if (v.sku) {
    const match = v.sku.match(/(\d+\s*(?:g|kg|ml|l|pack|pcs|pieces))/i);
    if (match) return match[0].toUpperCase();
    const parts = v.sku.split("-");
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length <= 8) return lastPart;
    return v.sku;
  }

  return `Option ${index + 1}`;
}

type ProductDetailPageProps = {
  /** Fetched on the server so the first HTML already contains the product (good for SEO). */
  initialProduct?: Product | null;
  initialCategories?: Category[] | null;
  initialDomains?: Domain[] | null;
};

export default function ProductDetailPage({
  initialProduct = null,
  initialCategories = null,
  initialDomains = null,
}: ProductDetailPageProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { productIds: wishlistedIds, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [domains, setDomains] = useState<Domain[]>(initialDomains ?? []);
  const [activeOffers, setActiveOffers] = useState<Coupon[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0,
  });
  const [activeTabKey, setActiveTabKey] = useState<string>("details");

  const handleReviewsChange = useCallback((summary: { average: number; count: number }) => {
    setReviewsSummary(summary);
  }, []);

  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  // Gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Variant selection
  const [selections, setSelections] = useState<Record<string, string> | null>(null);
  const [manualVariantId, setManualVariantId] = useState<string | null>(null);

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      if (!params.id) return;
      try {
        if (!initialProduct) setLoading(true);
        const [prod, cats, domainsRes, prodsRes, reviewsRes] = await Promise.all([
          catalogService.getProduct(params.id),
          catalogService.listCategories(),
          catalogService.listDomains(),
          catalogService.listProducts(),
          reviewsService.list({ productId: params.id }),
        ]);

        setProduct(prod);
        offersService.listActive(prod.domainId).then(setActiveOffers).catch(() => setActiveOffers([]));
        setCategories(cats || []);
        setDomains(domainsRes || []);
        setRelatedProducts(
          prodsRes.items.filter((p) => p._id !== params.id && p.categoryId === prod.categoryId)
        );

        if (reviewsRes.items.length > 0) {
          const avg =
            reviewsRes.items.reduce((s, r) => s + r.rating, 0) /
            reviewsRes.items.length;
          setReviewsSummary({ average: avg, count: reviewsRes.items.length });
        } else {
          setReviewsSummary({ average: 0, count: 0 });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id, initialProduct]);

  const domainCurrencyMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d._id, d.currency])),
    [domains]
  );

  const userId = (user?._id ?? user?.id ?? null) as string | null;
  const applicableOffers = useMemo(
    () => (product ? getApplicableOffers(getVisibleOffers(activeOffers, userId), product) : []),
    [activeOffers, product, userId]
  );
  const currency = product ? domainCurrencyMap[product.domainId] || "GBP" : "GBP";
  const category = categories.find((c) => c._id === product?.categoryId);

  // Variants calculation
  const variants = useMemo(() => product?.variants || [], [product]);
  const variantLabels = useMemo(() => uniqueVariantLabels(variants, formatVariantOptionLabel), [variants]);
  const optionKeys = useMemo(
    () => Array.from(new Set(variants.flatMap((v) => Object.keys(v.attributes || {})))),
    [variants]
  );

  const defaultVariant = useMemo(
    () => variants.find((v) => v.stock > 0) || variants[0] || null,
    [variants]
  );
  const activeSelections = useMemo(
    () => selections ?? (defaultVariant?.attributes || {}),
    [selections, defaultVariant]
  );

  const variant = useMemo(() => {
    if (variants.length === 0) return null;
    if (manualVariantId) {
      const manualMatch = variants.find((v) => v._id === manualVariantId);
      if (manualMatch) return manualMatch;
    }
    if (optionKeys.length === 0) return defaultVariant;
    return (
      variants.find((v) =>
        optionKeys.every((key) => v.attributes?.[key] === activeSelections[key])
      ) || defaultVariant
    );
  }, [variants, manualVariantId, optionKeys, activeSelections, defaultVariant]);

  // The selected variant's name goes in the title (the option buttons stay short: "100 · Pack of 2").
  const variantName = variant?.name?.trim();
  const productTitle =
    !product || !variantName || variants.length < 2
      ? product?.name
      : variantName.toLowerCase().includes(product.name.toLowerCase())
      ? variantName
      : `${product.name} – ${variantName}`;

  const price = variant?.price ?? product?.basePrice ?? 0;
  const comparePrice =
    (product ? getMrpComparePrice(product, price) : undefined) ??
    (product?.attributes?.comparePrice ? Number(product.attributes.comparePrice) : undefined);
  const hasDiscount = Boolean(comparePrice && comparePrice > price);
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;
  const savingsAmount = hasDiscount ? comparePrice! - price : 0;

  const stock = variant?.stock ?? product?.variants?.[0]?.stock ?? 10;
  const isOutOfStock = stock <= 0;

  // Gallery images: selected variant's images first, then the product's main images
  const galleryImages = useMemo(() => {
    const list = [
      ...(variant?.images || []),
      ...(product?.images || []),
    ].filter(Boolean);

    const uniqueList = Array.from(new Set(list));
    if (uniqueList.length > 0) return uniqueList;
    return [product ? getGroceryProductImage(product) : IMAGES.placeholders.product];
  }, [product, variant]);

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const isWishlisted = product ? wishlistedIds.includes(product._id) : false;

  const currentVariantId = variant?._id || product?.variants?.[0]?._id;

  const {
    cartQty,
    displayQty,
    localQty,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
  } = useProductCart({
    product,
    variantId: currentVariantId,
    price,
    stock,
    currency,
    image: activeImage,
  });

  const {
    getQty: getRelatedCartQty,
    handleAddToCart: handleRelatedAddToCart,
    handleUpdateQty: handleRelatedUpdateQty,
  } = useCartQuantity({
    products: relatedProducts,
    domainCurrencyMap,
  });

  // Product-level attributes, overridden by whatever the selected variant defines (e.g. its own weight).
  const detailAttributes: Record<string, string> = { ...(product?.attributes || {}), ...(variant?.attributes || {}) };

  // Variant values win; anything the variant leaves empty falls back to the main product.
  const nutrition = variant?.nutrition?.rows?.length ? variant.nutrition : product?.nutrition?.rows?.length ? product.nutrition : null;
  const sourcing = {
    ingredients: variant?.sourcing?.ingredients || product?.sourcing?.ingredients,
    allergenAdvice: variant?.sourcing?.allergenAdvice || product?.sourcing?.allergenAdvice,
    origin: variant?.sourcing?.origin || product?.sourcing?.origin,
  };
  const hasSourcing = Boolean(sourcing.ingredients || sourcing.allergenAdvice || sourcing.origin);

  const tabsItems = [
    {
      key: "details",
      label: "Description & Details",
      content: (
        <div className={styles.tabContent}>
          <p className={styles.tabDescriptionText}>
            {product?.description ||
              "A handcrafted piece made with certified materials and finished by our master artisans, designed to be treasured for a lifetime."}
          </p>

          <div className={styles.attributesGrid}>
            <div className={styles.attributeCard}>
              <span className={styles.attributeKey}>Brand</span>
              <span className={styles.attributeVal}>{product?.brand || "FreshMart"}</span>
            </div>
            <div className={styles.attributeCard}>
              <span className={styles.attributeKey}>Net Weight</span>
              <span className={styles.attributeVal}>{detailAttributes.weight || (product ? getProductWeight(product) : "Standard")}</span>
            </div>
            {Object.entries(detailAttributes).map(([k, v]) => {
              // Brand and Net Weight are the fixed cards above; comparePrice is internal.
              if (k === "comparePrice" || k === "weight" || !String(v ?? "").trim()) return null;
              return (
                <div key={k} className={styles.attributeCard}>
                  <span className={styles.attributeKey}>{k === "unit" ? "Pack" : formatLabel(k)}</span>
                  <span className={styles.attributeVal}>{k === "unit" ? formatUnit(v) : v}</span>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      key: "specs",
      label: "Specifications",
      content: (
        <div className={styles.tabContent}>
          <div className={styles.structuredInfoBox}>
            <h4 className={styles.structuredTitle}>Metal &amp; Craft Details</h4>
            <div className={styles.attributesGrid}>
              <div className={styles.attributeItem}>
                <span className={styles.attributeKey}>Material</span>
                <span className={styles.attributeVal}>{product?.attributes?.material || "18K Solid Gold"}</span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attributeKey}>Purity</span>
                <span className={styles.attributeVal}>{product?.attributes?.purity || "750 (18KT)"}</span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attributeKey}>Gemstone</span>
                <span className={styles.attributeVal}>{product?.attributes?.gemstone || "Natural Certified Diamond"}</span>
              </div>
              <div className={styles.attributeItem}>
                <span className={styles.attributeKey}>Certification</span>
                <span className={styles.attributeVal}>BIS Hallmarked &amp; IGI / SGL Certified</span>
              </div>
              {product?.attributes?.weight && (
                <div className={styles.attributeItem}>
                  <span className={styles.attributeKey}>Gross Weight</span>
                  <span className={styles.attributeVal}>{product.attributes.weight}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "shipping",
      label: "Shipping & Returns",
      content: (
        <div className={styles.tabContent}>
          <div className={styles.structuredInfoBox}>
            <h4 className={styles.structuredTitle}>Complimentary Insured Delivery</h4>
            <p style={{ margin: "0 0 12px 0", color: "#55504A", lineHeight: 1.6 }}>
              Every LUXE JWELS piece is packaged in a tamper-evident luxury gift box and dispatched via fully insured courier service.
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#55504A", lineHeight: 1.6 }}>
              <li>Dispatched within 24-48 hours with door-to-door GPS tracking.</li>
              <li>30-Day 100% money back return policy for unworn items.</li>
              <li>Complimentary lifetime cleaning and annual prong inspection.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      key: "reviews",
      label: reviewsSummary.count > 0 ? `Reviews (${reviewsSummary.count})` : "Reviews (0)",
      content: product ? (
        <ProductReviews
          productId={product._id}
          onReviewsChange={handleReviewsChange}
        />
      ) : null,
    },
  ];

  if (loading) {
    return (
      <StoreLayout>
        <Container>
          <div className={styles.container}>
            <Skeleton width="220px" height="20px" />
            <div className={styles.heroLayout}>
              <Skeleton height="460px" variant="rectangular" style={{ borderRadius: "20px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <Skeleton width="25%" height="16px" />
                <Skeleton width="85%" height="36px" />
                <Skeleton width="40%" height="28px" />
                <Skeleton height="50px" variant="rectangular" style={{ borderRadius: "10px" }} />
                <Skeleton height="100px" variant="rectangular" style={{ borderRadius: "14px" }} />
              </div>
            </div>
          </div>
        </Container>
      </StoreLayout>
    );
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <Container>
          <div style={{ padding: "80px 0" }}>
            <EmptyState
              title="Product not found"
              description={error || "The requested product does not exist or has been removed from our collection."}
              action={
                <Link href="/products" className={styles.addToBasketBtn} style={{ textDecoration: "none" }}>
                  Return to Shop All
                </Link>
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
          {/* 1. BREADCRUMB */}
          <nav aria-label="Breadcrumb" className={styles.breadcrumbRow}>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                ...(category
                  ? [{ label: category.name, href: `/category/${category.slug}` }]
                  : []),
                { label: product.name },
              ]}
            />
          </nav>

          {/* 2. PRODUCT HERO */}
          <section className={styles.heroLayout} aria-label="Product Overview">
            {/* LEFT: Product image / gallery */}
            <div className={styles.gallerySection}>
              <div
                className={styles.mainImageCard}
                onClick={() => setIsLightboxOpen(true)}
                role="button"
                tabIndex={0}
                aria-label="Click to enlarge image"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setIsLightboxOpen(true);
                  }
                }}
              >
                {hasDiscount && (
                  <div className={styles.floatingDiscountBadge}>
                    -{discountPercent}% OFF
                  </div>
                )}

                <button
                  type="button"
                  className={`${styles.floatingWishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      router.push("/login");
                      return;
                    }
                    toggleWishlist(product._id);
                  }}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon size={20} filled={isWishlisted} />
                </button>

                <button
                  type="button"
                  className={styles.floatingExpandBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  aria-label="Expand image"
                  title="Click to view full preview"
                >
                  <ExpandIcon size={18} />
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={product.name}
                  className={styles.mainImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = IMAGES.placeholders.product;
                  }}
                />
              </div>

              {galleryImages.length > 1 && (
                <div className={styles.thumbnailRow} aria-label="Product thumbnails">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.thumbnailBtn} ${idx === selectedImageIndex ? styles.active : ""
                        }`}
                      onClick={() => setSelectedImageIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className={styles.thumbnailImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product information and purchase controls */}
            <div className={styles.infoSection}>
              <div className={styles.brandLabel}>
                {product.brand || "LUXE JWELS"}
              </div>

              <h1 className={styles.productTitle}>{productTitle}</h1>

              {/* RATING */}
              <div className={styles.ratingRow}>
                {reviewsSummary.count > 0 ? (
                  <>
                    <Rating score={reviewsSummary.average} maxScore={5} size="sm" showScore={false} />
                    <span className={styles.ratingScore}>
                      {reviewsSummary.average.toFixed(1)}
                    </span>
                    <a
                      href="#reviews"
                      className={styles.reviewCount}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTabKey("reviews");
                        const el = document.getElementById("reviews");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      ({reviewsSummary.count} {reviewsSummary.count === 1 ? "review" : "reviews"})
                    </a>
                  </>
                ) : (
                  <>
                    <Rating score={0} maxScore={5} size="sm" showScore={false} />
                    <span className={styles.noReviewsLabel}>No reviews yet</span>
                    <a
                      href="#reviews"
                      className={styles.writeFirstReviewLink}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTabKey("reviews");
                        const el = document.getElementById("reviews");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Be the first to review
                    </a>
                  </>
                )}
              </div>

              {/* PRICE */}
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>
                  {formatPrice(price, currency)}
                </span>
                {hasDiscount && (
                  <span className={styles.comparePrice}>
                    {formatPrice(comparePrice!, currency)}
                  </span>
                )}
                {hasDiscount && (
                  <span className={styles.saveBadge}>
                    Save {formatPrice(savingsAmount, currency)}
                  </span>
                )}
                <span className={styles.taxNote}>(Incl. VAT)</span>
              </div>

              {/* EXTRA OFFERS for this product / its category */}
              {applicableOffers.length > 0 && (
                <ul className={styles.offerList} aria-label="Offers on this product">
                  {applicableOffers.map((offer) => (
                    <li key={offer._id} className={styles.offerItem}>
                      <span className={styles.offerItemTag}>{offerShortLabel(offer, currency)}</span>
                      <span>{offer.description}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* OPTION / SIZE SELECTION */}
              {variants.length > 1 && (
                <div className={styles.variantBlock}>
                  <div className={styles.variantLabelRow}>
                    <span className={styles.variantTitle}>Select Size / Option:</span>
                    {variant && (
                      <span className={styles.selectedVariantText}>
                        Selected: {variantLabels[variants.indexOf(variant)] ?? formatVariantOptionLabel(variant, 0)}
                      </span>
                    )}
                  </div>
                  {canGroupVariants(variants) ? (
                    <VariantSelector
                      variants={variants}
                      selected={variant}
                      formatPrice={(amount) => formatPrice(amount, currency)}
                      onSelect={(v) => {
                        if (v._id) setManualVariantId(v._id);
                        if (v.attributes) setSelections(v.attributes);
                        setSelectedImageIndex(0);
                      }}
                    />
                  ) : (
                  <div className={styles.variantOptions} role="radiogroup">
                    {variants.map((v, i) => {
                      const isSelected =
                        variant?._id === v._id ||
                        manualVariantId === v._id ||
                        (!manualVariantId && defaultVariant?._id === v._id);
                      const inStock = v.stock > 0;
                      const label = variantLabels[i];

                      return (
                        <button
                          key={v._id || i}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`${styles.variantPill} ${isSelected ? styles.active : ""
                            } ${!inStock ? styles.outOfStock : ""}`}
                          onClick={() => {
                            if (v._id) setManualVariantId(v._id);
                            if (v.attributes) setSelections(v.attributes);
                            setSelectedImageIndex(0);
                          }}
                          disabled={!inStock}
                        >
                          {label} {!inStock ? "(Out of stock)" : ""}
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>
              )}

              {stock > 0 && stock <= LOW_STOCK_THRESHOLD && (
                <p className={styles.lowStockHint}>Only {stock} left in stock — order soon</p>
              )}

              {/* QUANTITY & ADD TO CART & BUY NOW */}
              <div className={styles.purchaseActionRow}>
                <div className={styles.stepperContainer} role="group" aria-label="Product quantity">
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={handleDecrement}
                    disabled={(cartQty === 0 && localQty <= 1) || isOutOfStock}
                    aria-label={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                    title={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                  >
                    <MinusIcon size={16} />
                  </button>
                  <span className={styles.stepperValue}>
                    {displayQty}
                  </span>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={handleIncrement}
                    disabled={(cartQty > 0 ? cartQty >= stock : localQty >= stock) || isOutOfStock}
                    aria-label="Increase quantity"
                    title="Increase quantity"
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`${styles.addToBasketBtn} ${cartQty > 0 ? styles.inBasketBtn : ""}`}
                  onClick={() => handleAddToCart()}
                  disabled={isOutOfStock}
                  aria-label={cartQty > 0 ? `In cart (${cartQty}) - click to add one more` : "Add to Cart"}
                >
                  <ShoppingBagIcon size={18} />
                  <span>
                    {isOutOfStock
                      ? "Out of Stock"
                      : cartQty > 0
                      ? `In Cart (${cartQty})`
                      : "Add to Cart"}
                  </span>
                </button>

                {!isOutOfStock && (
                  <button
                    type="button"
                    className={styles.buyNowBtn}
                    onClick={async () => {
                      await handleAddToCart();
                      router.push("/cart");
                    }}
                  >
                    Buy Now
                  </button>
                )}
              </div>

              {cartQty > 0 && (
                <div className={styles.inBasketNotice}>
                  <CheckIcon size={14} />
                  <span>Item in your cart ({cartQty})</span>
                  <Link href="/cart" className={styles.viewBasketLink}>
                    View Cart &rarr;
                  </Link>
                </div>
              )}

              {/* DELIVERY & TRUST INFORMATION */}
              <div className={styles.trustDeliveryCard}>
                <div className={styles.trustItem}>
                  <div className={styles.trustIconWrap}>
                    <DiamondIcon size={15} />
                  </div>
                  <div>
                    <span className={styles.trustTitle}>Certified Jewellery:</span>
                    <span>100% Hallmarked gold &amp; certified diamonds</span>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIconWrap}>
                    <TruckIcon size={15} />
                  </div>
                  <div>
                    <span className={styles.trustTitle}>Insured Shipping:</span>
                    <span>Complimentary express delivery with transit insurance</span>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIconWrap}>
                    <RefreshCwIcon size={15} />
                  </div>
                  <div>
                    <span className={styles.trustTitle}>30-Day Easy Returns:</span>
                    <span>Hassle-free money back guarantee &amp; exchange</span>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIconWrap}>
                    <ShieldCheckIcon size={15} />
                  </div>
                  <div>
                    <span className={styles.trustTitle}>Lifetime Care:</span>
                    <span>Free annual polishing &amp; prong inspection</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. PRODUCT DETAILS TABS */}
          <section className={styles.tabsContainer} id="reviews" aria-label="Product Information Tabs">
            <Tabs
              items={tabsItems.filter((tab) => (tab.key === "ingredients" ? hasSourcing : tab.key === "nutrition" ? Boolean(nutrition) : true))}
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
            />
          </section>

          {/* 4. YOU MIGHT ALSO LIKE (Static 4-product grid with View All button) */}
          {relatedProducts.length > 0 && (
            <section className={styles.relatedSection} aria-label="You Might Also Like">
              <div className={styles.relatedHeader}>
                <div className={styles.relatedTitleGroup}>
                  <h2 className={styles.relatedTitle}>You Might Also Like</h2>
                  <p className={styles.relatedSubtitle}>More fresh picks from this category</p>
                </div>
                <Link
                  href={category ? `/category/${category.slug}` : "/products"}
                  className={styles.viewAllBtn}
                >
                  <span>View All</span>
                  <ArrowRightIcon size={15} aria-hidden="true" />
                </Link>
              </div>

              <div className={styles.relatedGrid}>
                {relatedProducts.slice(0, 4).map((p) => {
                  const relatedComparePrice =
                    getMrpComparePrice(p) ??
                    (p.attributes?.comparePrice ? Number(p.attributes.comparePrice) : undefined);

                  return (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.name}
                      {...variantCardProps(p)}
                      comparePrice={relatedComparePrice}
                      currency={domainCurrencyMap[p.domainId] || "GBP"}
                      image={getGroceryProductImage(p)}
                      brand={p.brand}
                      weight={getProductWeight(p)}
                      
                      isWishlisted={wishlistedIds.includes(p._id)}
                      cartQty={getRelatedCartQty(p._id)}
                      onAddToCart={handleRelatedAddToCart}
                      onUpdateQty={handleRelatedUpdateQty}
                      onToggleWishlist={toggleWishlist}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </Container>
      {product && (
        <ProductImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={galleryImages}
          initialIndex={selectedImageIndex}
          title={product.name}
        />
      )}
    </StoreLayout>
  );
}

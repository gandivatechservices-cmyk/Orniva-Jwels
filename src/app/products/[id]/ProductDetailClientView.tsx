"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "../../../components/StoreLayout";
import { Container } from "../../../components/layout/Container";
import { Breadcrumb } from "../../../components/ui/Breadcrumb";
import { Rating } from "../../../components/ui/Rating";
import { QuantityStepper } from "../../../components/ui/QuantityStepper";
import { Tabs } from "../../../components/ui/Tabs";
import { PendingSection } from "../../../components/ui/PendingSection";
import { ProductRail } from "../../../components/common/ProductRail";
import {
  CartIcon,
  CheckIcon,
  HeartIcon,
  LeafIcon,
  TruckIcon,
} from "../../../components/icons";
import type { Category, Domain, Product, Variant } from "../../../utility/services";
import { useCart, useWishlist } from "hooks";
import { formatPrice } from "../../../utility/formatMoney";
import { IMAGES } from "../../../constants/images";
import { ProductReviews } from "./ProductReviews";
import styles from "./product.module.css";

function formatLabel(value: string) {
  const spaced = value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return spaced.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

import { formatUnit, uniqueVariantLabels } from "utility/variantLabels";

function getVariantLabel(v: Variant, index: number): string {
  const attrs = v.attributes || {};
  const parts: string[] = [];
  if (attrs.weight) parts.push(attrs.weight);
  if (attrs.volume) parts.push(attrs.volume);
  if (attrs.count) parts.push(attrs.count);
  if (attrs.size) parts.push(formatLabel(attrs.size));
  if (attrs.flavor) parts.push(formatLabel(attrs.flavor));
  if (attrs.unit) parts.push(formatUnit(attrs.unit));

  if (parts.length > 0) return parts.join(" • ");

  const other = Object.values(attrs).filter(Boolean);
  if (other.length > 0) return other.map((val) => formatLabel(String(val))).join(" • ");

  if (v.name?.trim()) return v.name.trim();
  if (v.sku) {
    const segs = v.sku.split("-");
    return segs[segs.length - 1] || v.sku;
  }
  return `Option ${index + 1}`;
}

export type ProductDetailClientViewProps = {
  product: Product;
  category: Category | null;
  domains: Domain[];
  relatedProducts: Product[];
  reviewsSummary: { average: number; count: number };
};

export function ProductDetailClientView({
  product,
  category,
  domains,
  relatedProducts,
  reviewsSummary,
}: ProductDetailClientViewProps) {
  const { addItem, updateQty, items: cartItems } = useCart();
  const { productIds: wishlistedIds, toggle: toggleWishlist } = useWishlist();

  // Selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Auto-select first in-stock variant
  const initialVariant = product.variants?.find((v) => v.stock > 0) || product.variants?.[0] || null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariant?._id || null
  );
  const [qty, setQty] = useState(1);

  const domainCurrencyMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d._id, d.currency])),
    [domains]
  );
  const currency = domainCurrencyMap[product.domainId] || "GBP";

  // Active variant resolution
  const variants = useMemo(() => product.variants || [], [product]);
  const variantLabels = useMemo(() => uniqueVariantLabels(variants, getVariantLabel), [variants]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    if (selectedVariantId) {
      const found = variants.find((v) => v._id === selectedVariantId);
      if (found) return found;
    }
    return variants.find((v) => v.stock > 0) || variants[0] || null;
  }, [variants, selectedVariantId]);

  const price = selectedVariant?.price ?? product.basePrice ?? 0;
  const stock = selectedVariant?.stock ?? product.variants?.[0]?.stock ?? 10;
  const isOutOfStock = stock <= 0;

  // Gallery images: selected variant's images first, then the product's main images
  const galleryImages = useMemo(() => {
    const list = Array.from(
      new Set([
        ...(selectedVariant?.images || []),
        ...(product.images || []),
      ].filter(Boolean))
    );
    return list.length > 0 ? list : [IMAGES.placeholders.product];
  }, [product, selectedVariant]);

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const isWishlisted = wishlistedIds.includes(product._id);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product._id,
        variantId: selectedVariant?._id,
        name: product.name,
        variantLabel: selectedVariant ? variantLabels[variants.indexOf(selectedVariant)] ?? getVariantLabel(selectedVariant, 0) : undefined,
        price,
        domainId: product.domainId,
        currency,
        image: activeImage,
        stock,
      },
      qty
    );
  };

  const tabsItems = [
    {
      key: "details",
      label: "Description & Details",
      content: (
        <div className={styles.tabContent}>
          <p>{product.description || "Fresh and premium quality grocery item, locally sourced."}</p>
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <table className={styles.attributesTable}>
              <tbody>
                {Object.entries(product.attributes).map(([k, v]) => (
                  <tr key={k} className={styles.attributeRow}>
                    <td className={styles.attributeKey}>{formatLabel(k)}</td>
                    <td className={styles.attributeVal}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ),
    },
    {
      key: "ingredients",
      label: "Ingredients & Sourcing",
      content: (
        <PendingSection
          title="Ingredients & Traceability"
          pendingFeature="farm sourcing & allergen breakdown endpoint"
        />
      ),
    },
    {
      key: "nutrition",
      label: "Nutrition Facts",
      content: (
        <PendingSection
          title="Nutritional Information"
          pendingFeature="certified nutritional facts & macro table API"
        />
      ),
    },
    {
      key: "reviews",
      label: reviewsSummary.count > 0 ? `Reviews (${reviewsSummary.count})` : "Reviews (0)",
      content: <ProductReviews productId={product._id} />,
    },
  ];

  return (
    <StoreLayout>
      <Container>
        <div className={styles.container}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumbRow}>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                ...(category
                  ? [{ label: category.name, href: `/category/${encodeURIComponent(category.slug || category._id)}` }]
                  : []),
                { label: product.name },
              ]}
            />
          </div>

          {/* Main Product Details Card */}
          <div className={styles.mainGrid}>
            {/* Gallery Section */}
            <div className={styles.gallerySection}>
              <div className={styles.mainImageWrapper}>
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
                <div className={styles.thumbnailRow}>
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

            {/* Info Section */}
            <div className={styles.infoSection}>
              <span className={styles.brand}>{product.brand || "Atlas Fresh"}</span>
              <h1 className={styles.title}>{product.name}</h1>

              <div className={styles.ratingRow}>
                {reviewsSummary.count > 0 ? (
                  <>
                    <Rating score={reviewsSummary.average} maxScore={5} size="sm" />
                    <span className={styles.ratingScore}>
                      {reviewsSummary.average.toFixed(1)}
                    </span>
                    <a href="#reviews" className={styles.reviewCount}>
                      ({reviewsSummary.count} {reviewsSummary.count === 1 ? "review" : "reviews"})
                    </a>
                  </>
                ) : (
                  <>
                    <Rating score={0} maxScore={5} size="sm" />
                    <span className={styles.noReviewsLabel}>No reviews yet</span>
                    <a href="#reviews" className={styles.writeFirstReviewLink}>
                      Be the first to review
                    </a>
                  </>
                )}
              </div>

              <div className={styles.priceBlock}>
                <span className={styles.price}>{formatPrice(price, currency)}</span>
              </div>

              {/* Variant Selector */}
              {variants.length > 1 && (
                <div className={styles.variantBlock}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className={styles.variantTitle}>
                      Select Option:{" "}
                      {selectedVariant && (
                        <strong style={{ textTransform: "none", color: "var(--color-primary)" }}>
                          {variantLabels[variants.indexOf(selectedVariant)] ?? getVariantLabel(selectedVariant, 0)}
                        </strong>
                      )}
                    </span>
                    {selectedVariant && (
                      <span style={{ fontSize: "var(--fs-xs)", color: "var(--color-subtle)" }}>
                        {selectedVariant.stock > 0
                          ? `${selectedVariant.stock} in stock`
                          : "Out of stock"}
                      </span>
                    )}
                  </div>
                  <div className={styles.variantOptions}>
                    {variants.map((v, i) => {
                      const isSelected = selectedVariant?._id === v._id;
                      const inStock = v.stock > 0;
                      const label = variantLabels[i];

                      return (
                        <button
                          key={v._id || i}
                          type="button"
                          className={`${styles.variantPill} ${isSelected ? styles.active : ""
                            } ${!inStock ? styles.outOfStock : ""}`}
                          onClick={() => {
                            if (v._id) {
                              setSelectedVariantId(v._id);
                              setQty(1);
                              setSelectedImageIndex(0);
                            }
                          }}
                          disabled={!inStock}
                          aria-pressed={isSelected}
                          title={!inStock ? "Currently out of stock" : `${label} - ${formatPrice(v.price, currency)}`}
                        >
                          <span>{label}</span>
                          <span className={styles.variantPillPrice}>
                            {formatPrice(v.price, currency)}
                          </span>
                          {!inStock && <span>(Out of stock)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity and Actions Row */}
              <div className={styles.quantityActionsRow}>
                <QuantityStepper
                  value={qty}
                  min={1}
                  max={stock}
                  onChange={(newQty) => setQty(newQty)}
                  disabled={isOutOfStock}
                />

                <button
                  type="button"
                  className={styles.addToBasketBtn}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <CartIcon size={18} />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Basket"}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""
                    }`}
                  onClick={() => toggleWishlist(product._id)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon size={20} filled={isWishlisted} />
                </button>
              </div>

              {/* Delivery and Freshness Info */}
              <div className={styles.deliveryInfoBlock}>
                <div className={styles.deliveryFeature}>
                  <CheckIcon size={16} style={{ color: "var(--color-primary)" }} />
                  <span>
                    <strong>In Stock:</strong> Ready for express local grocery packing
                  </span>
                </div>
                <div className={styles.deliveryFeature}>
                  <TruckIcon size={16} style={{ color: "var(--color-primary)" }} />
                  <span>
                    <strong>Next-Day Delivery:</strong> Free on grocery orders over £30
                  </span>
                </div>
                <div className={styles.deliveryFeature}>
                  <LeafIcon size={16} style={{ color: "var(--color-primary)" }} />
                  <span>
                    <strong>100% Quality Checked:</strong> Direct farm-to-table freshness
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className={styles.tabsContainer} id="reviews">
            <Tabs items={tabsItems} defaultActiveKey="details" />
          </div>

          {/* Related Products Rail */}
          {relatedProducts.length > 0 && (
            <ProductRail
              title="You Might Also Like"
              subtitle="More fresh picks from this category"
              products={relatedProducts.map((p) => {
                const cartItem = cartItems.find((ci) => ci.productId === p._id);
                return {
                  id: p._id,
                  name: p.name,
                  price: p.basePrice,
                  currency: domainCurrencyMap[p.domainId] || "GBP",
                  image: p.images?.[0],
                  brand: p.brand,
                  stock: p.variants?.[0]?.stock ?? 10,
                  isWishlisted: wishlistedIds.includes(p._id),
                  cartQty: cartItem ? cartItem.qty : 0,
                };
              })}
              onAddToCart={(id) => {
                const item = relatedProducts.find((p) => p._id === id);
                if (item) {
                  addItem({
                    productId: item._id,
                    variantId: item.variants?.[0]?._id,
                    name: item.name,
                    price: item.basePrice,
                    domainId: item.domainId,
                    currency: domainCurrencyMap[item.domainId] || "GBP",
                    image: item.images?.[0] || IMAGES.placeholders.product,
                    stock: item.variants?.[0]?.stock ?? 10,
                  });
                }
              }}
              onUpdateQty={(id, newQty) => {
                const cartItem = cartItems.find((ci) => ci.productId === id);
                if (cartItem) updateQty(cartItem.key, newQty);
              }}
              onToggleWishlist={toggleWishlist}
            />
          )}
        </div>
      </Container>
    </StoreLayout>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProductCard, ProductCardSkeleton } from "../../components/common";
import { useAuth, useWishlist, useCartQuantity } from "hooks";
import { getGroceryProductImage } from "../../constants/images";
import { getMrpComparePrice } from "../../utility/activeOffers";
import styles from "./wishlist.module.css";
import { variantCardProps } from "utility/variantPricing";

export default function WishlistPage() {
  const { isAuthenticated, showAuthModal } = useAuth();
  const {
    items: wishlistedProducts,
    loading,
    error,
    toggle: toggleWishlist,
    loadWishlist,
  } = useWishlist();

  const { getQty, handleAddToCart, handleUpdateQty } = useCartQuantity({
    products: wishlistedProducts,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated, loadWishlist]);

  return (
    <StoreLayout>
      <Container>
        <div className={styles.pageContainer}>
          {/* Breadcrumb Navigation */}
          <div className={styles.breadcrumbRow}>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Wishlist" },
              ]}
            />
          </div>

          {/* Heading */}
          <div className={styles.headingRow}>
            <div>
              <h1 className={styles.title}>My Saved Jewelry</h1>
              <p className={styles.subtitle}>
                Handcrafted pieces you’ve saved to your private LUXE JWELS collection.
              </p>
            </div>
            {!loading && wishlistedProducts.length > 0 && (
              <span className={styles.countBadge}>
                {wishlistedProducts.length}{" "}
                {wishlistedProducts.length === 1 ? "saved piece" : "saved pieces"}
              </span>
            )}
          </div>

          {/* State Views / Grid */}
          {!isAuthenticated ? (
            <div style={{ padding: "60px 0" }}>
              <EmptyState
                title="Sign in to view your wishlist"
                description="Sign in to your account to access your saved fine jewelry pieces across any device."
                action={
                  <Button
                    onClick={() =>
                      showAuthModal({
                        tab: "login",
                        message: "Sign in to access your saved wishlist items.",
                      })
                    }
                  >
                    Sign In
                  </Button>
                }
              />
            </div>
          ) : loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load wishlist"
              description={error}
              action={
                <Button onClick={() => loadWishlist()}>Try Again</Button>
              }
            />
          ) : wishlistedProducts.length === 0 ? (
            <EmptyState
              title="Your jewelry wishlist is empty"
              description="Explore our certified fine jewelry catalog and tap the heart icon on any piece to save it here."
              action={
                <Link href="/products" className={styles.primaryBtn}>
                  Explore Collections
                </Link>
              }
            />
          ) : (
            <div className={styles.grid}>
              {wishlistedProducts.map((p) => {
                const comparePrice =
                  getMrpComparePrice(p) ??
                  (p.attributes?.comparePrice ? Number(p.attributes.comparePrice) : undefined);
                const weight =
                  p.attributes?.weight ||
                  p.attributes?.size ||
                  p.attributes?.unit ||
                  p.attributes?.netWeight ||
                  p.attributes?.packSize ||
                  p.variants?.[0]?.attributes?.weight ||
                  p.variants?.[0]?.attributes?.size ||
                  p.name.match(/\b(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|oz|pack|pcs|pieces|count|bags))\b/i)?.[0];

                return (
                  <ProductCard
                    key={p._id}
                    id={p._id}
                    name={p.name}
                    {...variantCardProps(p)}
                    comparePrice={comparePrice}
                    currency="GBP"
                    image={getGroceryProductImage(p)}
                    brand={p.brand}
                    weight={weight}
                    
                    isWishlisted={true}
                    cartQty={getQty(p._id)}
                    onAddToCart={handleAddToCart}
                    onUpdateQty={handleUpdateQty}
                    onToggleWishlist={(id) => toggleWishlist(id, p)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </StoreLayout>
  );
}

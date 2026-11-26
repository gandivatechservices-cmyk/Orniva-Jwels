"use client";

import { useEffect } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProductCard, ProductCardSkeleton, TopContentCard } from "../../components/common";
import { useAuth, useWishlist, useCartQuantity } from "hooks";
import { getGroceryProductImage, IMAGES } from "../../constants/images";
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
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="CURATED COLLECTION"
          title="My Saved Jewelry"
          subtitle="Handcrafted pieces you’ve saved to your private ORNIVA JEWELS collection."
          image={IMAGES.jewelry.categories.rings}
          imageAlt="Private Saved Jewelry Collection"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Wishlist" },
          ]}
          badge={
            !loading && wishlistedProducts.length > 0 ? (
              <span className={styles.countBadge}>
                {wishlistedProducts.length}{" "}
                {wishlistedProducts.length === 1 ? "saved piece" : "saved pieces"}
              </span>
            ) : undefined
          }
          ariaLabel="My Saved Jewelry"
        />

        <Container>
          {/* State Views / Grid */}
          {!isAuthenticated ? (
            <EmptyState
              preset="wishlistSignIn"
              onAction={() =>
                showAuthModal({
                  tab: "login",
                  message: "Sign in to access your saved wishlist items.",
                })
              }
            />
          ) : loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState preset="error" title="Unable to load wishlist" description={error} onAction={() => loadWishlist()} />
          ) : wishlistedProducts.length === 0 ? (
            <EmptyState preset="wishlist" />
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
        </Container>
      </div>
    </StoreLayout>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { StoreLayout } from "../../../components/StoreLayout";
import { Container } from "../../../components/layout/Container";
import { TopContentCard } from "../../../components/common/TopContentCard";
import { ProductCard, ProductCardSkeleton } from "../../../components/common";
import { IMAGES } from "../../../constants/images";
import {
  catalogService,
  offersService,
  type Catalog,
  type Coupon,
  type Domain,
  type Product,
} from "../../../utility/services";
import { findBestDisplayOffer, getComparePrice, getProductOfferLabel } from "../../../utility/activeOffers";
import { variantCardProps } from "utility/variantPricing";
import { useWishlist, useCartQuantity } from "hooks";
import styles from "../../home.module.css";

export default function CatalogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { productIds: wishlistedIds, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    async function load() {
      try {
        const [cat, all, doms] = await Promise.all([
          catalogService.getCatalog(id),
          catalogService.listAllProducts(),
          catalogService.listDomains().catch(() => [] as Domain[]),
        ]);
        setCatalog(cat);
        setProducts((all || []).filter((p) => p.isActive && p.catalogId === id));
        setDomains(doms || []);
        const active = await Promise.all((doms || []).map((d) => offersService.listActive(d._id).catch(() => [] as Coupon[])));
        setOffers(active.flat());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load this catalog.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const domainCurrencyMap = useMemo(() => Object.fromEntries(domains.map((d) => [d._id, d.currency])), [domains]);
  const { getQty, handleAddToCart, handleUpdateQty } = useCartQuantity({ products, domainCurrencyMap });

  return (
    <StoreLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(36px, 4vw, 56px)", paddingBottom: "80px", width: "100%" }}>
        <TopContentCard
          eyebrow="FINE JEWELLERY CATALOGUE"
          title={catalog?.name || (loading ? "Loading Collection..." : "Curated Collection")}
          subtitle={catalog?.description || "Explore handcrafted artisanal masterpieces in this curated jewellery collection."}
          image={IMAGES.jewelry.designerPromo}
          imageAlt={catalog?.name || "Jewellery Collection"}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Catalogs", href: "/catalogs" },
            { label: catalog?.name || "Catalog" },
          ]}
          badge={
            !loading && products.length > 0 ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#DFC08A",
                  backgroundColor: "rgba(167, 123, 63, 0.2)",
                  border: "1px solid rgba(167, 123, 63, 0.4)",
                  padding: "4px 14px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {products.length} {products.length === 1 ? "Piece" : "Pieces"} Available
              </span>
            ) : undefined
          }
          ariaLabel={catalog?.name || "Catalog Details"}
        />

        <Container>
          <div className={styles.pageStack}>

          {error && <p role="alert">{error}</p>}

          <div className={styles.productGrid}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : products.length === 0 && !error ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 24, color: "var(--color-muted)" }}>
                No products in this catalog yet.
              </div>
            ) : (
              products.map((p) => {
                const bestOffer = findBestDisplayOffer(offers, p);
                return (
                  <ProductCard
                    key={p._id}
                    id={p._id}
                    name={p.name}
                    {...variantCardProps(p)}
                    comparePrice={getComparePrice(p, bestOffer)}
                    offerLabel={getProductOfferLabel(offers, p, domainCurrencyMap[p.domainId])}
                    currency={domainCurrencyMap[p.domainId] || "GBP"}
                    image={p.images?.[0]}
                    brand={p.brand}
                    isWishlisted={wishlistedIds.includes(p._id)}
                    cartQty={getQty(p._id)}
                    onAddToCart={handleAddToCart}
                    onUpdateQty={handleUpdateQty}
                    onToggleWishlist={(pid) => toggleWishlist(pid, p)}
                  />
                );
              })
            )}
          </div>
        </div>
      </Container>
      </div>
    </StoreLayout>
  );
}

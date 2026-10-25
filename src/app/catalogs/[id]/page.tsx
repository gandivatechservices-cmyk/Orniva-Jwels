"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { StoreLayout } from "../../../components/StoreLayout";
import { Container } from "../../../components/layout/Container";
import { Breadcrumb } from "../../../components/ui/Breadcrumb";
import { ProductCard, ProductCardSkeleton } from "../../../components/common";
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
      <Container>
        <div className={styles.pageStack}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Catalogs", href: "/catalogs" },
              { label: catalog?.name || "Catalog" },
            ]}
          />
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h1 className={styles.sectionTitle}>{catalog?.name || (loading ? "Loading..." : "Catalog")}</h1>
              {catalog?.description && <p className={styles.sectionSubtitle}>{catalog.description}</p>}
            </div>
          </div>

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
    </StoreLayout>
  );
}

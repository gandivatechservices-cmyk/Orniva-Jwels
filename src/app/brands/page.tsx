"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { BrandCard } from "../../components/common/BrandCard";
import { SearchIcon } from "../../components/icons";
import { IMAGES } from "../../constants/images";
import { catalogService, type Brand, type Product } from "../../utility/services";
import styles from "./brands.module.css";

export default function BrandsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [apiBrands, setApiBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        setError(null);
        const [res, brandList] = await Promise.all([
          catalogService.listProducts(),
          catalogService.listBrands().catch(() => [] as Brand[]),
        ]);
        setProducts(res.items?.filter((p) => p.isActive) || []);
        setApiBrands((brandList || []).filter((b) => b.isActive !== false));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load brands.");
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  const allBrands = useMemo(() => {
    const brandMap = new Map<string, { id: string; name: string; logo?: string; count: number }>();

    // Brands managed in the admin come first, with the logo that was uploaded there.
    apiBrands.forEach((b) => {
      const norm = b.name.trim().toLowerCase();
      brandMap.set(norm, { id: b._id, name: b.name, logo: b.logoUrl || undefined, count: 0 });
    });

    // Count products per brand, and pick up any brand that only exists as text on a product.
    products.forEach((p) => {
      const populated = typeof p.brandId === "object" && p.brandId ? p.brandId : null;
      const name = (populated?.name || p.brand || "").trim();
      if (!name) return;
      const norm = name.toLowerCase();
      const existing = brandMap.get(norm);
      if (existing) {
        existing.count += 1;
      } else {
        brandMap.set(norm, { id: norm, name, logo: populated?.logoUrl || undefined, count: 1 });
      }
    });

    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, apiBrands]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return allBrands;
    const q = searchQuery.toLowerCase().trim();
    return allBrands.filter((b) => b.name.toLowerCase().includes(q));
  }, [allBrands, searchQuery]);

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="CURATED DESIGNER ATELIERS"
          title="Our Brands & Designers"
          subtitle="Explore celebrated jewellery houses, artisanal craft studios, and luxury designers in our collection."
          image={IMAGES.jewelry.designerPromo}
          imageAlt="Fine Jewelry Brands & Designers"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Brands" },
          ]}
          badge={
            !loading ? (
              <span className={styles.brandCountBadge}>
                {filteredBrands.length} {filteredBrands.length === 1 ? "Brand" : "Brands"}
              </span>
            ) : undefined
          }
          ariaLabel="Jewelry Brands & Designers"
        />

        <Container>
          <div className={styles.mainWrapper}>
            <div className={styles.searchWrap}>
              <SearchIcon size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search jewellery designers and brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search brands"
              />
            </div>

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} height="80px" variant="rectangular" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load brands"
              description={error}
              action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
            />
          ) : filteredBrands.length === 0 ? (
            <EmptyState
              title="No brands found"
              description={`We couldn't find any brands matching "${searchQuery}".`}
              action={
                <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
              }
            />
          ) : (
            <div className={styles.grid}>
              {filteredBrands.map((b) => (
                <BrandCard
                  key={b.id}
                  id={b.id}
                  name={b.name}
                  logo={b.logo}
                  href={`/products?brand=${encodeURIComponent(b.name)}`}
                />
              ))}
            </div>
          )}
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

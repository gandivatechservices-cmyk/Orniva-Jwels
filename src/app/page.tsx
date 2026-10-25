"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { StoreLayout } from "../components/StoreLayout";
import { Container } from "../components/layout/Container";
import {
  HeroBanner,
  ProductCard,
  ProductCardSkeleton,
  BrandCard,
  ServiceBenefits,
  NewsletterSection,
} from "../components/common";
import { ShopByCategory } from "../components/category";
import { PromoBanner } from "../components/promotional";
import {
  catalogService,
  offersService,
  type Brand,
  type Catalog,
  type Category,
  type Coupon,
  type Domain,
  type Product,
} from "../utility/services";
import { useWishlist, useCartQuantity } from "hooks";
import { IMAGES, getGroceryProductImage } from "../constants/images";
import {
  LeafIcon,
  ArrowRightIcon,
} from "../components/icons";
import { findBestDisplayOffer, getComparePrice, getMrpComparePrice, getProductOfferLabel } from "../utility/activeOffers";
import styles from "./home.module.css";
import { variantCardProps } from "utility/variantPricing";
import { buildCatalogShowcase, showcaseStyle } from "utility/catalogShowcase";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [activeOffers, setActiveOffers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { productIds: wishlistedIds, toggle: toggleWishlist } = useWishlist();

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    async function loadHomeData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes, domainsRes, brandsRes, catalogsRes] = await Promise.all([
          catalogService.listRootCategories(),
          catalogService.listProducts(),
          catalogService.listDomains(),
          catalogService.listBrands().catch(() => []),
          catalogService.listCatalogs().catch(() => [] as Catalog[]),
        ]);
        const filteredCats = (catsRes || []).filter((cat) => {
          const s = (cat.slug || "").toLowerCase();
          const n = (cat.name || "").toLowerCase();
          return !["audio", "shirt", "fashion", "men", "device", "phone", "iphone", "jewel", "ring", "gold", "wireless"].some(
            (unrelated) => s.includes(unrelated) || n.includes(unrelated)
          );
        });
        const priorityKeywords = [
          "fresh",
          "produce",
          "fruit",
          "dairy",
          "bakery",
          "bread",
          "rice",
          "grain",
          "indian",
          "spice",
          "meat",
          "frozen",
          "snack",
          "drink",
          "household",
        ];

        const getCategoryScore = (cat: Category) => {
          const text = `${cat.slug} ${cat.name}`.toLowerCase();
          const index = priorityKeywords.findIndex((k) => text.includes(k));
          return index === -1 ? 999 : index;
        };

        const sortedCats = [...filteredCats].sort((a, b) => getCategoryScore(a) - getCategoryScore(b));
        setCategories(sortedCats);
        setBrands((brandsRes || []).filter((b) => b.isActive !== false));
        setCatalogs(catalogsRes || []);
        const activeProducts = prodsRes?.items?.filter((p) => p.isActive) || [];
        setProducts(activeProducts);
        setDomains(domainsRes || []);

        const domainIds = [...new Set((domainsRes || []).map((d) => d._id))];
        const offersByDomain = await Promise.all(
          domainIds.map((domainId) => offersService.listActive(domainId).catch(() => []))
        );
        setActiveOffers(offersByDomain.flat());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load storefront data.");
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const domainCurrencyMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d._id, d.currency])),
    [domains]
  );

  const { getQty, handleAddToCart, handleUpdateQty } = useCartQuantity({
    products,
    domainCurrencyMap,
  });

  // Brands come from the API with the logo uploaded in the admin.
  const popularBrands = brands.map((b) => ({ id: b._id, name: b.name, logo: b.logoUrl || undefined }));
  // Repeat the list so the scrolling strip always has enough cards to loop smoothly.
  const marqueeBrands = Array.from({ length: Math.max(2, Math.ceil(16 / Math.max(popularBrands.length, 1))) }, () => popularBrands).flat();

  const catalogShowcase = buildCatalogShowcase(catalogs, products);
  const featuredCatalogs = catalogShowcase.slice(0, 2);


  // Everyday Grocery Essentials: core discovery products
  const groceryFiltered = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    return !["audio", "shirt", "fashion", "men", "device", "phone", "iphone", "jewel", "ring", "gold", "wireless"].some(
      (unrelated) => name.includes(unrelated) || brand.includes(unrelated)
    );
  });
  const everydayEssentials = (groceryFiltered.length >= 4 ? groceryFiltered : products).slice(0, 4);

  // Weekly Offers: products with a currently-active, price-representable offer (real data, not fabricated)
  const productsWithOffers = products
    .map((p) => ({ product: p, offer: findBestDisplayOffer(activeOffers, p) }))
    .filter((entry) => entry.offer !== null || getMrpComparePrice(entry.product) !== undefined);
  const weeklyOffersProducts = productsWithOffers.length > 0 ? productsWithOffers.slice(0, 4) : [];

  return (
    <StoreLayout>
      {/* 1. HERO BANNER */}
      <HeroBanner
        eyebrowText="AUTHENTIC & DELICIOUS. EVERY DAY."
        subtitle="Your favourite Indian namkeen, ready-to-eat meals, pantry staples, and everyday groceries."
        primaryCtaText="Shop Groceries"
        primaryCtaHref="/products"
        secondaryCtaText="View Offers"
        secondaryCtaHref="/products?offers=true"
        imageSrc={IMAGES.hero.packagedFood}
        imageAlt="Packaged Indian food, namkeen snacks, ready-to-eat curries and groceries"
      />

      <Container>
        <div className={styles.homeContainer}>
          {/* 2. SHOP BY CATEGORY (LIVE API) */}
          <ShopByCategory
            title="Shop by Category"
            viewAllText="View All"
            viewAllHref="/categories"
            categories={categories}
            loading={loading}
            error={error}
          />

          {/* 3. FEATURED CATALOGS (first two by default, View All for the rest) */}
          {featuredCatalogs.length > 0 && (
            <section aria-label="Featured Catalogs">
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>Featured Catalogs</h2>
                  <p className={styles.sectionSubtitle}>Browse our ranges</p>
                </div>
                <Link href="/catalogs" className={styles.viewAllLink}>
                  View All <ArrowRightIcon size={14} />
                </Link>
              </div>
              <div className={styles.promoGrid}>
                {featuredCatalogs.map(({ catalog, image, productCount }, index) => {
                  const look = showcaseStyle(index);
                  return (
                    <PromoBanner
                      key={catalog._id}
                      label={look.label}
                      title={catalog.name}
                      description={catalog.description || `${productCount} product${productCount === 1 ? "" : "s"} available.`}
                      buttonText={`Shop ${catalog.name}`}
                      href={`/catalogs/${catalog._id}`}
                      variant={look.variant}
                      image={image}
                      imageAlt={catalog.name}
                      imageFit="cover"
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. POPULAR BRANDS CONTINUOUS MARQUEE */}
          {popularBrands.length > 0 && (
            <section aria-label="Popular Brands">
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>Popular Brands</h2>
                  <p className={styles.sectionSubtitle}>Trusted brands for your everyday needs</p>
                </div>
              </div>

              <div className={styles.brandsMarqueeWrapper}>
                <div className={styles.brandsMarqueeTrack}>
                  {marqueeBrands.map((brand, idx) => (
                    <BrandCard
                      key={`${brand.id}-${idx}`}
                      id={brand.id}
                      name={brand.name}
                      logo={brand.logo}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 5. EVERYDAY GROCERY ESSENTIALS */}
          <section aria-label="Everyday Grocery Essentials">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>Everyday Grocery Essentials</h2>
                <p className={styles.sectionSubtitle}>Everything you need for your everyday shop.</p>
              </div>
              <Link href="/products" prefetch={false} className={styles.viewAllLink}>
                <span>View All</span>
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.productGrid}>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : everydayEssentials.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--color-muted)" }}>
                  No grocery essentials available right now.
                </div>
              ) : (
                everydayEssentials.map((p) => {
                  const bestOffer = findBestDisplayOffer(activeOffers, p);
                  const comparePrice = getComparePrice(p, bestOffer);
                  const weight =
                    p.attributes?.weight ||
                    p.attributes?.size ||
                    p.attributes?.unit ||
                    p.attributes?.netWeight ||
                    p.attributes?.packSize ||
                    p.variants?.[0]?.attributes?.weight ||
                    p.variants?.[0]?.attributes?.size ||
                    p.name.match(/\b(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|oz|pack|pcs|pieces|count|bags))\b/i)?.[0];

                  const imageSrc = getGroceryProductImage(p);

                  return (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.name}
                      {...variantCardProps(p)}
                      comparePrice={comparePrice}
                      offerLabel={getProductOfferLabel(activeOffers, p, domainCurrencyMap[p.domainId])}
                      currency={domainCurrencyMap[p.domainId] || "GBP"}
                      image={imageSrc}
                      brand={p.brand}
                      weight={weight}
                      
                      isWishlisted={wishlistedIds.includes(p._id)}
                      cartQty={getQty(p._id)}
                      onAddToCart={handleAddToCart}
                      onUpdateQty={handleUpdateQty}
                      onToggleWishlist={(id) => toggleWishlist(id, p)}
                    />
                  );
                })
              )}
            </div>
          </section>

          {/* 6. SERVICE BENEFITS TRUST STRIP */}
          <ServiceBenefits />

          {/* 7. WEEKLY OFFERS PRODUCT GRID */}
          <section aria-label="Weekly Offers Products">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>Weekly Offers</h2>
                <p className={styles.sectionSubtitle}>Handpicked savings on everyday family favorites</p>
              </div>
              <Link href="/products?offers=true" prefetch={false} className={styles.viewAllLink}>
                <span>View All Offers</span>
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.productGrid}>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : weeklyOffersProducts.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--color-muted)" }}>
                  No offer products available right now. Check back soon!
                </div>
              ) : (
                weeklyOffersProducts.map(({ product: p, offer }) => {
                  const comparePrice = getComparePrice(p, offer);
                  const weight =
                    p.attributes?.weight ||
                    p.attributes?.size ||
                    p.attributes?.unit ||
                    p.attributes?.netWeight ||
                    p.attributes?.packSize ||
                    p.variants?.[0]?.attributes?.weight ||
                    p.variants?.[0]?.attributes?.size ||
                    p.name.match(/\b(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|oz|pack|pcs|pieces|count|bags))\b/i)?.[0];
                  const imageSrc = getGroceryProductImage(p);

                  return (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.name}
                      {...variantCardProps(p)}
                      comparePrice={comparePrice}
                      offerLabel={getProductOfferLabel(activeOffers, p, domainCurrencyMap[p.domainId])}
                      currency={domainCurrencyMap[p.domainId] || "GBP"}
                      image={imageSrc}
                      brand={p.brand}
                      weight={weight}
                      
                      isWishlisted={wishlistedIds.includes(p._id)}
                      cartQty={getQty(p._id)}
                      onAddToCart={handleAddToCart}
                      onUpdateQty={handleUpdateQty}
                      onToggleWishlist={(id) => toggleWishlist(id, p)}
                    />
                  );
                })
              )}
            </div>
          </section>

          {/* 8. NEWSLETTER */}
          <NewsletterSection />
        </div>
      </Container>
    </StoreLayout>
  );
}

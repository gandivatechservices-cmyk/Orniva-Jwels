"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { StoreLayout } from "../components/StoreLayout";
import { Container } from "../components/layout/Container";
import {
  HeroBanner,
  ProductCard,
  ProductCardSkeleton,
  ServiceBenefits,
} from "../components/common";
import { ShopByCategory } from "../components/category";
import {
  catalogService,
  offersService,
  type Category,
  type Coupon,
  type Domain,
  type Product,
} from "../utility/services";
import { useWishlist, useCartQuantity } from "hooks";
import { IMAGES, getGroceryProductImage } from "../constants/images";
import {
  ArrowRightIcon,
  DiamondIcon,
  ShieldCheckIcon,
  StarIcon,
  RefreshCwIcon,
  TruckIcon,
} from "../components/icons";
import { findBestDisplayOffer, getComparePrice, getMrpComparePrice, getProductOfferLabel } from "../utility/activeOffers";
import styles from "./home.module.css";
import { variantCardProps } from "utility/variantPricing";

const TESTIMONIALS = [
  {
    name: "Pooja S.",
    city: "Ahmedabad",
    rating: 5,
    text: "The quality is amazing and delivery was super fast. My wife loved the diamond halo ring!",
  },
  {
    name: "Rahul M.",
    city: "Surat",
    rating: 5,
    text: "Beautiful collection and excellent customer service. The gold finish and certification are 100% authentic.",
  },
  {
    name: "Neha K.",
    city: "Rajkot",
    rating: 5,
    text: "Best place to buy genuine diamond and hallmarked gold jewellery online! Will definitely shop again.",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeOffers, setActiveOffers] = useState<Coupon[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
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
        const [catsRes, prodsRes, domainsRes] = await Promise.all([
          catalogService.listRootCategories(),
          catalogService.listProducts(),
          catalogService.listDomains(),
        ]);

        // Prioritize jewelry categories
        const priorityKeywords = [
          "ring",
          "necklace",
          "earring",
          "bracelet",
          "pendant",
          "bangle",
          "men",
          "wedding",
          "bridal",
          "gold",
          "diamond",
          "jewel",
        ];

        const allCats = catsRes || [];
        const getCategoryScore = (cat: Category) => {
          const text = `${cat.slug} ${cat.name}`.toLowerCase();
          const index = priorityKeywords.findIndex((k) => text.includes(k));
          return index === -1 ? 999 : index;
        };

        const sortedCats = [...allCats].sort((a, b) => getCategoryScore(a) - getCategoryScore(b));
        setCategories(sortedCats);

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

  // Filter products by selected tab
  const filteredProducts = useMemo(() => {
    if (selectedCategoryTab === "all") return products;
    return products.filter((p) => {
      const pName = (p.name || "").toLowerCase();
      const pCategory = (p.categoryId || "").toLowerCase();
      const target = selectedCategoryTab.toLowerCase();
      return pName.includes(target) || pCategory.includes(target);
    });
  }, [products, selectedCategoryTab]);

  const featuredDisplayProducts = (filteredProducts.length > 0 ? filteredProducts : products).slice(0, 8);

  const categoryTabs = [
    { id: "all", label: "All Collections" },
    { id: "ring", label: "Rings" },
    { id: "necklace", label: "Necklaces" },
    { id: "earring", label: "Earrings" },
    { id: "bracelet", label: "Bracelets" },
    { id: "pendant", label: "Pendants" },
    { id: "bangle", label: "Bangles" },
    { id: "men", label: "Men's" },
  ];

  return (
    <StoreLayout>
      {/* 1. HERO BANNER */}
      <HeroBanner
        eyebrowText="FINE JEWELLERY • HANDCRAFTED EXCELLENCE"
        title={
          <>
            <span style={{ color: "#FAF8F4" }}>Timeless Elegance,</span>
            <span style={{ color: "#C5A16B", fontStyle: "italic" }}>Crafted for You</span>
          </>
        }
        subtitle="Discover exquisite jewelry designed to celebrate every moment. Where exceptional craftsmanship meets enduring beauty."
        primaryCtaText="Shop Now"
        primaryCtaHref="/products"
        secondaryCtaText="Discover Our Craftsmanship"
        secondaryCtaHref="/manufacturing"
        imageSrc={IMAGES.jewelry.heroModel}
        imageAlt="Model wearing luxury emerald and diamond necklace"
      />

      <Container>
        <div className={styles.homeContainer}>
          {/* 2. SERVICE BENEFITS TRUST STRIP */}
          <ServiceBenefits />

          {/* 3. SHOP BY CATEGORY (CIRCULAR VIGNETTES) */}
          <ShopByCategory
            title="Shop By Category"
            subtitle="Discover our exquisite collections"
            viewAllText="View All"
            viewAllHref="/categories"
            categories={categories}
            limit={8}
            loading={loading}
            error={error}
          />

          {/* 4. MANUFACTURING & CRAFTSMANSHIP EDITORIAL BANNER */}
          <section className={styles.manufacturingBanner} aria-label="Explore Our Manufacturing">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGES.jewelry.manufacturingCraftsman}
              alt="Jeweler setting diamonds by hand"
              className={styles.manufacturingBg}
            />
            <div className={styles.manufacturingOverlay} />
            <div className={styles.manufacturingContent}>
              <div className={styles.manufacturingEyebrow}>ARTISTRY & HERITAGE</div>
              <h2 className={styles.manufacturingTitle}>Explore Our Manufacturing</h2>
              <p className={styles.manufacturingSubtitle}>
                From raw precious metals to polished masterpieces, discover the meticulous artistry behind every single piece.
              </p>
              <Link href="/manufacturing" className={styles.manufacturingBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Discover Our Process</span>
              </Link>
            </div>
          </section>

          {/* 5. FEATURED COLLECTIONS PRODUCT SHOWCASE */}
          <section aria-label="Featured Collections">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>Featured Collections</h2>
                <p className={styles.sectionSubtitle}>Handcrafted luxury tailored for life&apos;s finest moments</p>
              </div>
              <Link href="/products" prefetch={false} className={styles.viewAllLink}>
                <span>View All</span>
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Link>
            </div>

            {/* Category Filter Tabs */}
            <div className={styles.filterTabsRow} role="tablist" aria-label="Collection Tabs">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategoryTab === tab.id}
                  className={`${styles.tabPill} ${selectedCategoryTab === tab.id ? styles.tabPillActive : ""}`}
                  onClick={() => setSelectedCategoryTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : featuredDisplayProducts.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px", color: "var(--color-muted)" }}>
                  No jewelry pieces found in this category right now.
                </div>
              ) : (
                featuredDisplayProducts.map((p) => {
                  const bestOffer = findBestDisplayOffer(activeOffers, p);
                  const comparePrice = getComparePrice(p, bestOffer);
                  const specs =
                    p.attributes?.material ||
                    p.attributes?.purity ||
                    p.attributes?.weight ||
                    p.attributes?.size ||
                    p.variants?.[0]?.attributes?.purity ||
                    "18K Gold";

                  const imageSrc = p.images?.[0] || IMAGES.placeholders.product;

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
                      brand={p.brand || "LUXE JWELS"}
                      weight={specs}
                      rating={4.9}
                      reviewCount={p.variants?.length ? p.variants.length * 12 + 18 : 24}
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

          {/* 6. DUAL EDITORIAL PROMOTIONAL CARDS */}
          <section className={styles.editorialPromoGrid} aria-label="Featured Promotions">
            <Link href="/products" className={styles.editorialCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGES.jewelry.designerPromo}
                alt="Designer Jewellery for every occasion"
                className={styles.editorialImage}
              />
              <div className={styles.editorialCardOverlay} />
              <div className={styles.editorialCardBody}>
                <span className={styles.editorialLabel}>NEW ARRIVALS</span>
                <h3 className={styles.editorialCardTitle}>Designer Jewellery<br />For Every Occasion</h3>
                <span className={styles.editorialCardCta}>Shop Now &rarr;</span>
              </div>
            </Link>

            <Link href="/contact" className={styles.editorialCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGES.jewelry.customPromo}
                alt="Custom Jewellery bring your dream to life"
                className={styles.editorialImage}
              />
              <div className={styles.editorialCardOverlay} />
              <div className={styles.editorialCardBody}>
                <span className={styles.editorialLabel}>BESPOKE ATELIER</span>
                <h3 className={styles.editorialCardTitle}>Custom Jewellery<br />Bring Your Dream to Life</h3>
                <span className={styles.editorialCardCta}>Get Started &rarr;</span>
              </div>
            </Link>
          </section>

          {/* 7. CUSTOMER TESTIMONIALS: "LOVED BY THOUSANDS" */}
          <section aria-label="Customer Testimonials">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>Loved by Thousands</h2>
                <p className={styles.sectionSubtitle}>Real stories and genuine reviews from our patrons</p>
              </div>
              <Link href="/reviews" className={styles.viewAllLink}>
                <span>View All Reviews</span>
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.testimonialsGrid}>
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className={styles.testimonialCard}>
                  <div className={styles.starsRow}>
                    {Array.from({ length: t.rating }).map((_, sIdx) => (
                      <StarIcon key={sIdx} size={15} filled />
                    ))}
                  </div>
                  <p className={styles.testimonialQuote}>&ldquo;{t.text}&rdquo;</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>{t.name.charAt(0)}</div>
                    <div className={styles.authorDetails}>
                      <span className={styles.authorName}>{t.name}</span>
                      <span className={styles.authorLocation}>{t.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 8. LUXURY TRUST BANNER ("Luxury. Trust. Forever.") */}
          <section className={styles.luxuryTrustBanner} aria-label="Luxury Trust Forever">
            <div className={styles.luxuryTrustHero}>
              <div className={styles.luxuryTrustText}>
                <h2 className={styles.luxuryTrustTitle}>Luxury. Trust. Forever.</h2>
                <p style={{ color: "#D5CFC7", margin: 0, fontSize: "0.95rem", lineHeight: 1.5, maxWidth: "420px" }}>
                  Every gemstone hand-selected. Every setting cast with 100% certified metals and hallmarked authenticity.
                </p>
                <Link href="/products" className={styles.luxuryTrustCta}>
                  Shop Collection &rarr;
                </Link>
              </div>

              <div className={styles.luxuryTrustImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMAGES.jewelry.luxuryTrust}
                  alt="Fine diamond solitaire ring on luxury slate"
                  className={styles.luxuryTrustImg}
                />
              </div>
            </div>

            <div className={styles.luxuryTrustStrip}>
              <div className={styles.luxuryTrustItem}>
                <div className={styles.luxuryTrustIcon}><DiamondIcon size={18} /></div>
                <div className={styles.luxuryTrustInfo}>
                  <span className={styles.luxuryTrustHead}>100% Authentic</span>
                  <span className={styles.luxuryTrustSub}>Certified Jewellery</span>
                </div>
              </div>

              <div className={styles.luxuryTrustItem}>
                <div className={styles.luxuryTrustIcon}><ShieldCheckIcon size={18} /></div>
                <div className={styles.luxuryTrustInfo}>
                  <span className={styles.luxuryTrustHead}>Secure Packaging</span>
                  <span className={styles.luxuryTrustSub}>Safe &amp; Elegant</span>
                </div>
              </div>

              <div className={styles.luxuryTrustItem}>
                <div className={styles.luxuryTrustIcon}><RefreshCwIcon size={18} /></div>
                <div className={styles.luxuryTrustInfo}>
                  <span className={styles.luxuryTrustHead}>Easy Return</span>
                  <span className={styles.luxuryTrustSub}>30 Days Hassle-Free</span>
                </div>
              </div>

              <div className={styles.luxuryTrustItem}>
                <div className={styles.luxuryTrustIcon}><TruckIcon size={18} /></div>
                <div className={styles.luxuryTrustInfo}>
                  <span className={styles.luxuryTrustHead}>Dedicated Support</span>
                  <span className={styles.luxuryTrustSub}>We&apos;re here for you</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </StoreLayout>
  );
}

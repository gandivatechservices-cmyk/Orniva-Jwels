"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { StoreLayout } from "../components/StoreLayout";
import { Container } from "../components/layout/Container";
import {
  HeroBanner,
  VideoBanner,
  ProductCard,
  ProductCardSkeleton,
  ServiceBenefits,
} from "../components/common";
import { CollectionShowcase } from "../components/category";
import { type Category } from "../utility/services";
import { getCachedHomeData, isHomeDataFresh, loadHomeData, type HomeData } from "../utility/homeData";
import { useWishlist, useCartQuantity } from "hooks";
import { IMAGES, getGroceryProductImage } from "../constants/images";
import { ArrowRightIcon, StarIcon } from "../components/icons";
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
  // Home data is kept in memory (see utility/homeData.ts): coming back to this page shows it instantly
  // with no request, and it is only refreshed in the background when it has gone stale.
  const [data, setData] = useState<HomeData | null>(getCachedHomeData);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");

  const { productIds: wishlistedIds, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    if (isHomeDataFresh()) return;
    let alive = true;
    loadHomeData()
      .then((result) => alive && setData(result))
      .catch((err: unknown) => {
        if (alive && !getCachedHomeData()) setError(err instanceof Error ? err.message : "Failed to load storefront data.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const loading = !data && !error;

  // Prioritize jewelry categories
  const categories = useMemo(() => {
    const priorityKeywords = ["ring", "necklace", "earring", "bracelet", "pendant", "bangle", "men", "wedding", "bridal", "gold", "diamond", "jewel"];
    const score = (cat: Category) => {
      const text = `${cat.slug} ${cat.name}`.toLowerCase();
      const index = priorityKeywords.findIndex((k) => text.includes(k));
      return index === -1 ? 999 : index;
    };
    return [...(data?.categories || [])].sort((a, b) => score(a) - score(b));
  }, [data]);
  const products = useMemo(() => (data?.products || []).filter((p) => p.isActive), [data]);
  const domains = useMemo(() => data?.domains || [], [data]);
  const activeOffers = useMemo(() => data?.offers || [], [data]);

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
    { id: "all", label: "All" },
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
        title={
          <>
            <span>Timeless Elegance,</span>
            <span>Crafted for You</span>
          </>
        }
        subtitle="Premium jewellery for every moment. Tradition. Craftsmanship. Forever."
        primaryCtaText="Shop Now"
        primaryCtaHref="/products"
        secondaryCtaText="Watch Video"
        secondaryCtaHref="/manufacturing"
        imageSrc={IMAGES.jewelry.heroModel}
        imageAlt="Model wearing luxury emerald and diamond necklace"
      />

      <Container>
        <div className={styles.homeContainer}>
          {/* 2. SERVICE BENEFITS TRUST STRIP */}
          <ServiceBenefits />

          {/* 3. EXPLORE THE COLLECTION (BENTO GRID) */}
          <CollectionShowcase
            title="Explore the collection"
            viewAllText="View all collections"
            viewAllHref="/categories"
            categories={categories}
            limit={6}
            loading={loading}
            error={error}
          />

          {/* 4. MANUFACTURING & CRAFTSMANSHIP EDITORIAL BANNER */}
          <VideoBanner
            eyebrow="Our Craft"
            title="Explore Our Manufacturing"
            subtitle="From Raw Material to Masterpiece"
            imageSrc={IMAGES.jewelry.manufacturingCraftsman}
            imageAlt="Jeweler setting diamonds by hand"
            ctaText="Discover Our Craft"
            ctaHref="/manufacturing"
            steps={["Design", "Casting", "Stone Setting", "Polishing", "Certification"]}
          />

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
                      brand={p.brand || "ORNIVA JEWELS"}
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
                <h3 className={styles.editorialCardTitle}>Designer Jewellery</h3>
                <p className={styles.editorialCardText}>For Every Occasion</p>
                <span className={styles.editorialCardCta}>Shop Now</span>
              </div>
            </Link>

            <Link href="/custom-jewellery" className={styles.editorialCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGES.jewelry.customPromo}
                alt="Custom Jewellery bring your dream to life"
                className={styles.editorialImage}
              />
              <div className={styles.editorialCardOverlay} />
              <div className={styles.editorialCardBody}>
                <h3 className={styles.editorialCardTitle}>Custom Jewellery</h3>
                <p className={styles.editorialCardText}>Bring Your Dream to Life</p>
                <span className={styles.editorialCardCta}>Get Started</span>
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
                  <div className={styles.authorAvatar} aria-hidden="true">{t.name.charAt(0)}</div>
                  <div className={styles.testimonialBody}>
                    <p className={styles.testimonialQuote}>&ldquo;{t.text}&rdquo;</p>
                    <div className={styles.starsRow} aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, sIdx) => (
                        <StarIcon key={sIdx} size={13} filled />
                      ))}
                    </div>
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
                <Link href="/products" className={styles.luxuryTrustCta}>
                  Shop Collection
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
          </section>
        </div>
      </Container>
    </StoreLayout>
  );
}

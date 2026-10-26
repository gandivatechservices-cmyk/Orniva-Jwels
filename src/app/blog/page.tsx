"use client";

import Link from "next/link";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { ArrowRightIcon } from "../../components/icons";
import { IMAGES } from "../../constants/images";
import styles from "./blog.module.css";

const ARTICLES = [
  {
    slug: "how-to-choose-the-perfect-engagement-ring",
    category: "Buyer's Guide",
    title: "How to Choose the Perfect Engagement Ring",
    excerpt: "Understanding the 4Cs of diamond selection, metal pairing, and finding a setting that reflects your unique love story.",
    date: "18 May 2026",
    readTime: "5 min read",
    image: IMAGES.jewelry.categories.rings,
  },
  {
    slug: "5-latest-jewellery-trends-for-2026",
    category: "Trends",
    title: "5 Latest Jewellery Trends for 2026",
    excerpt: "From bold sculptural cuffs to colored gemstone solitaires, discover the styles redefining luxury fine jewelry.",
    date: "12 May 2026",
    readTime: "4 min read",
    image: IMAGES.jewelry.designerPromo,
  },
  {
    slug: "caring-for-your-diamond-jewellery",
    category: "Jewellery Care",
    title: "Caring for Your Diamond Jewellery",
    excerpt: "Expert advice on cleaning, safe storage, and professional inspections to preserve your gemstones' brilliant fire forever.",
    date: "08 May 2026",
    readTime: "3 min read",
    image: IMAGES.jewelry.customPromo,
  },
  {
    slug: "gold-vs-diamond-investment-guide",
    category: "Investment",
    title: "Gold vs Diamond — Which is Better Investment?",
    excerpt: "An in-depth analysis on intrinsic gold purity, diamond certification value, and building a heritage jewelry portfolio.",
    date: "28 Apr 2026",
    readTime: "6 min read",
    image: IMAGES.jewelry.luxuryTrust,
  },
  {
    slug: "anatomy-of-a-diamond-halo-ring",
    category: "Craftsmanship",
    title: "The Anatomy of a Diamond Halo Ring",
    excerpt: "Why the halo setting creates an illusion of larger diamond surface area while amplifying light dispersion.",
    date: "15 Apr 2026",
    readTime: "4 min read",
    image: IMAGES.jewelry.categories.necklaces,
  },
  {
    slug: "mens-fine-jewellery-styling",
    category: "Style Guide",
    title: "Modern Men's Fine Jewellery: Stacking & Styling",
    excerpt: "How to curate signet rings, heavy link chains, and diamond accessories with effortless masculine sophistication.",
    date: "04 Apr 2026",
    readTime: "4 min read",
    image: IMAGES.jewelry.categories.mens,
  },
];

export default function BlogPage() {
  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="EDITORIAL & INSIGHTS"
          title="Blog & Guides"
          subtitle="Jewellery Tips, Trends & Stories"
          image={IMAGES.jewelry.designerPromo}
          imageAlt="Jewelry styling and editorial guide"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Blog" },
          ]}
          ariaLabel="Blog & Guides"
        />

        <Container>
          <div className={styles.articlesGrid}>
            {ARTICLES.map((a) => (
              <article key={a.slug} className={styles.articleCard}>
                <div className={styles.imageWrap}>
                  <span className={styles.articleCategoryBadge}>{a.category}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} className={styles.articleImg} />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metaRow}>
                    <span>{a.date}</span>
                    <span>{a.readTime}</span>
                  </div>
                  <h2 className={styles.articleTitle}>{a.title}</h2>
                  <p className={styles.articleExcerpt}>{a.excerpt}</p>
                  <Link href={`/blog/${a.slug}`} className={styles.readMoreLink}>
                    <span>Read Article</span>
                    <ArrowRightIcon size={12} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

"use client";

import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { DiamondIcon, ShieldCheckIcon, SparklesIcon, HeartIcon } from "../../components/icons";
import { IMAGES } from "../../constants/images";
import styles from "./about.module.css";

const VALUES = [
  {
    icon: <SparklesIcon size={24} />,
    title: "Quality",
    desc: "Every diamond is ethically sourced and 100% certified. Every gold alloy is hallmarked to guaranteed purity.",
  },
  {
    icon: <ShieldCheckIcon size={24} />,
    title: "Trust",
    desc: "Complete transparency in pricing, stone grading, and weight with independent lab certifications.",
  },
  {
    icon: <DiamondIcon size={24} />,
    title: "Craftsmanship",
    desc: "Master artisans with generational heritage translating modern elegance into timeless heirloom jewelry.",
  },
  {
    icon: <HeartIcon size={24} />,
    title: "Customer First",
    desc: "Dedicated personal styling consultations, lifetime complimentary polishing, and hassle-free returns.",
  },
];

const STATS = [
  { number: "25+", label: "Years of Excellence" },
  { number: "10K+", label: "Happy Patrons" },
  { number: "500+", label: "Unique Designs" },
  { number: "12", label: "Countries Served" },
];

export default function AboutPage() {
  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          eyebrow="OUR HERITAGE"
          title="Our Story"
          subtitle="Crafting Dreams Since 1995"
          image={IMAGES.jewelry.heroModel}
          imageAlt="Luxe Jewels craft tradition"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
          ariaLabel="Our Story"
        />

        <Container>
          {/* BRAND STORY INTRO */}
          <section className={styles.storyIntro} aria-label="Brand Introduction">
            <span className={styles.brandNameLead}>WE ARE LUXE JWELS</span>
            <h2 className={styles.storyTitle}>A Legacy of Timeless Elegance &amp; Devoted Craftsmanship</h2>
            <p className={styles.storyParagraph}>
              For over two and a half decades, LUXE JWELS has stood as a beacon of artisanal luxury. From delicate
              daily wear solitaire diamond rings to grand royal bridal necklaces, each creation begins with an artistic vision
              and culminates in an enduring celebration of life&apos;s most meaningful milestones.
            </p>
            <p className={styles.storyParagraph}>
              Headquartered with ateliers in Ahmedabad, India, we unite master hand-fabrication techniques with contemporary
              precision engineering. We believe luxury is not just an adornment, but an intimate reflection of personal beauty,
              love, and heritage.
            </p>
          </section>

          {/* VALUES */}
          <section className={styles.valuesSection} style={{ marginTop: 48 }} aria-label="Our Values">
            <div className={styles.valuesHeader}>
              <h2 className={styles.valuesTitle}>Our Core Values</h2>
              <p style={{ color: "#77716A", margin: "6px 0 0 0", fontSize: "0.95rem" }}>
                Principles that guide every piece we cast, set, and polish
              </p>
            </div>

            <div className={styles.valuesGrid}>
              {VALUES.map((v) => (
                <div key={v.title} className={styles.valueCard}>
                  <div className={styles.valueIconCircle}>{v.icon}</div>
                  <h3 className={styles.valueCardTitle}>{v.title}</h3>
                  <p className={styles.valueCardDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* STATS ROW */}
          <section className={styles.statsRow} style={{ marginTop: 48 }} aria-label="Company Statistics">
            {STATS.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statNumber}>{s.number}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </section>
        </Container>
      </div>
    </StoreLayout>
  );
}

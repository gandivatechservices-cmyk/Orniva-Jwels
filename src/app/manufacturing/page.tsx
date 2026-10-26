"use client";

import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { IMAGES } from "../../constants/images";
import styles from "./manufacturing.module.css";

const PROCESS_STEPS = [
  {
    step: "1",
    title: "Concept & Design",
    desc: "From initial hand sketches to intricate 3D CAD modeling, visualizing perfection.",
  },
  {
    step: "2",
    title: "Precision Casting",
    desc: "Molten 18K & 22K hallmarked gold is cast using modern lost-wax techniques.",
  },
  {
    step: "3",
    title: "Master Setting",
    desc: "Certified diamonds and gemstones are handset under microscopes for lasting security.",
  },
  {
    step: "4",
    title: "Artisanal Polish",
    desc: "Multi-stage hand polishing brings out radiant mirror shine and silky touch.",
  },
  {
    step: "5",
    title: "Quality Check",
    desc: "Rigorous 100% inspection for gemstone alignment, structural integrity, and purity.",
  },
];

const JOURNEY_STAGES = [
  { name: "Raw Material", image: IMAGES.jewelry.categories.rings },
  { name: "Precision Casting", image: IMAGES.jewelry.manufacturingCraftsman },
  { name: "Micro Setting", image: IMAGES.jewelry.customPromo },
  { name: "Hand Polishing", image: IMAGES.jewelry.categories.necklaces },
  { name: "Final Masterpiece", image: IMAGES.jewelry.luxuryTrust },
];

export default function ManufacturingPage() {
  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        {/* HERO BANNER */}
        <section className={styles.heroBanner} aria-label="Our Manufacturing">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES.jewelry.manufacturingCraftsman}
            alt="Jewelry manufacturing process"
            className={styles.heroBg}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>ARTISANAL EXCELLENCE</span>
            <h1 className={styles.heroTitle}>Our Manufacturing</h1>
            <p className={styles.heroSubtitle}>Tradition &bull; Craftsmanship &bull; Perfection</p>
            <div className={styles.playCircleBtn} title="Watch Craftsmanship Video">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </section>

        <Container>
          {/* 5 PROCESS STEPS */}
          <section className={styles.processSection} aria-label="5 Step Crafting Process">
            <div className={styles.sectionHeadingGroup}>
              <h2 className={styles.sectionTitle}>The 5 Steps of Perfection</h2>
              <p className={styles.sectionSubtitle}>
                Discover the journey each piece takes from raw precious metals to your heirloom collection.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {PROCESS_STEPS.map((s) => (
                <div key={s.step} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{s.step}</div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* WATCH THE JOURNEY PHOTO GRID */}
          <section className={styles.processSection} style={{ marginTop: 40 }} aria-label="Watch the Journey">
            <div className={styles.sectionHeadingGroup}>
              <h2 className={styles.sectionTitle}>Watch the Journey</h2>
              <p className={styles.sectionSubtitle}>
                Behind the scenes of fine craftsmanship at our atelier.
              </p>
            </div>

            <div className={styles.journeyGrid}>
              {JOURNEY_STAGES.map((stage, idx) => (
                <div key={idx} className={styles.journeyCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stage.image} alt={stage.name} className={styles.journeyImg} />
                  <div className={styles.journeyOverlay}>
                    <h4 className={styles.journeyStageName}>{stage.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </div>
    </StoreLayout>
  );
}

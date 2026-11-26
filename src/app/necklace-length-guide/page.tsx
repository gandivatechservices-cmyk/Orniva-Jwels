"use client";

import { useState } from "react";
import Link from "next/link";
import { StoreLayout } from "components/StoreLayout";
import { Container } from "components/layout/Container";
import { TopContentCard } from "components/common/TopContentCard";
import { Reveal } from "components/common/Reveal";
import { Accordion } from "components/ui/Accordion";
import { CheckIcon, ArrowRightIcon } from "components/icons";
import { IMAGES } from "constants/images";
import {
  NECKLACE_LENGTH_PAGE,
  NECKLACE_STYLES,
  formatStyleRange,
  formatStyleRangeCm,
  necklaceLengthChartCsv,
  type NecklaceStyle,
} from "constants/necklaceLength";
import { downloadTextFile } from "utility/downloadRingSizeChart";
// Shares the layout/animation styles of the ring size guide so both guides look identical.
import styles from "../ring-size-guide/ring-size-guide.module.css";

const P = NECKLACE_LENGTH_PAGE;

export default function NecklaceLengthGuidePage() {
  const [styleId, setStyleId] = useState("");
  const [result, setResult] = useState<NecklaceStyle | null>(null);
  const [error, setError] = useState("");

  const find = () => {
    const found = NECKLACE_STYLES.find((s) => s.id === styleId);
    if (!found) {
      setResult(null);
      return setError("Please choose a style.");
    }
    setError("");
    setResult(found);
  };

  return (
    <StoreLayout>
      <TopContentCard
        eyebrow={P.hero.eyebrow}
        title={P.hero.title}
        subtitle={P.hero.subtitle}
        image={IMAGES.jewelry.categories.necklaces}
        breadcrumbs={[...P.hero.breadcrumbs]}
        actions={
          <a href={P.hero.primaryCta.href} className={styles.heroCta}>
            {P.hero.primaryCta.label}
            <ArrowRightIcon size={15} aria-hidden="true" />
          </a>
        }
      />

      <Container size="wide">
        <div className={styles.page}>
          {/* STEPS */}
          <section className={styles.section} aria-labelledby="steps-title">
            <Reveal>
              <header className={styles.sectionHead}>
                <span className={styles.eyebrow}>{P.stepsSection.eyebrow}</span>
                <h2 id="steps-title" className={styles.sectionTitle}>{P.stepsSection.title}</h2>
                <p className={styles.sectionIntro}>{P.stepsSection.intro}</p>
              </header>
            </Reveal>

            <ol className={styles.steps}>
              {P.stepsSection.steps.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 0.1} className={styles.stepCard}>
                    <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepText}>{step.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>

            <Reveal>
              <ul className={styles.tips}>
                {P.stepsSection.tips.map((tip) => (
                  <li key={tip}>
                    <CheckIcon size={14} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          {/* STYLE FINDER */}
          <section id="length-finder" className={styles.section} aria-labelledby="finder-title">
            <Reveal>
              <header className={styles.sectionHead}>
                <span className={styles.eyebrow}>{P.finder.eyebrow}</span>
                <h2 id="finder-title" className={styles.sectionTitle}>{P.finder.title}</h2>
              </header>
            </Reveal>

            <Reveal className={styles.converter}>
              <div className={styles.converterFields}>
                <div className={`${styles.field} ${styles.fieldActive}`}>
                  <label htmlFor="nl-style">{P.finder.label}</label>
                  <select
                    id="nl-style"
                    value={styleId}
                    onChange={(e) => {
                      setStyleId(e.target.value);
                      setError("");
                    }}
                  >
                    <option value="">Select a style</option>
                    {NECKLACE_STYLES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatStyleRange(s)})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" className={styles.findBtn} onClick={find}>
                  {P.finder.cta}
                </button>
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}

              {result && (
                <div className={styles.result} key={result.id} aria-live="polite">
                  <p className={styles.resultMain}>
                    {P.finder.resultPrefix}: <strong>{formatStyleRange(result)}</strong>
                  </p>
                  <div className={styles.resultGrid}>
                    <span><em>Style</em>{result.name}</span>
                    <span><em>Length</em>{formatStyleRangeCm(result)}</span>
                    <span><em>Sits</em>{result.sits}</span>
                    <span><em>Best for</em>{result.bestFor}</span>
                  </div>
                  <Link href={P.finder.shopCta.href} className={styles.shopBtn}>
                    {P.finder.shopCta.label}
                  </Link>
                </div>
              )}

              <p className={styles.promo}>{P.finder.promo}</p>
            </Reveal>
          </section>

          {/* CHART */}
          <section className={styles.section} aria-labelledby="chart-title">
            <Reveal>
              <header className={styles.sectionHead}>
                <span className={styles.eyebrow}>{P.chart.eyebrow}</span>
                <h2 id="chart-title" className={styles.sectionTitle}>{P.chart.title}</h2>
                <p className={styles.sectionIntro}>{P.chart.note}</p>
              </header>
            </Reveal>

            <Reveal>
              <div className={styles.chartBar} style={{ justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className={styles.downloadBtn}
                  onClick={() => downloadTextFile(necklaceLengthChartCsv(), "necklace-length-chart.csv")}
                >
                  {P.finder.downloadCta}
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Style</th>
                      <th>Length (in)</th>
                      <th>Length (cm)</th>
                      <th>Where it sits</th>
                      <th>Best for</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NECKLACE_STYLES.map((s) => (
                      <tr key={s.id} className={result?.id === s.id ? styles.rowActive : ""}>
                        <td>{s.name}</td>
                        <td>{formatStyleRange(s)}</td>
                        <td>{formatStyleRangeCm(s)}</td>
                        <td style={{ whiteSpace: "normal", textAlign: "left" }}>{s.sits}</td>
                        <td style={{ whiteSpace: "normal", textAlign: "left" }}>{s.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </section>

          {/* FAQ */}
          <section className={styles.section} aria-labelledby="faq-title">
            <Reveal>
              <header className={styles.sectionHead}>
                <span className={styles.eyebrow}>{P.faqs.eyebrow}</span>
                <h2 id="faq-title" className={styles.sectionTitle}>{P.faqs.title}</h2>
              </header>
            </Reveal>
            <Reveal className={styles.faq}>
              <Accordion
                allowMultiple={false}
                items={P.faqs.items.map((f, i) => ({
                  id: `necklace-faq-${f.id}`,
                  title: f.question,
                  content: <p className={styles.faqAnswer}>{f.answer}</p>,
                  defaultOpen: i === 0,
                }))}
              />
            </Reveal>
          </section>

          {/* CTA */}
          <Reveal>
            <section className={styles.cta}>
              <h2 className={styles.ctaTitle}>{P.cta.title}</h2>
              <p className={styles.ctaText}>{P.cta.text}</p>
              <div className={styles.ctaActions}>
                <Link href={P.cta.primary.href} className={styles.ctaPrimary}>{P.cta.primary.label}</Link>
                <Link href={P.cta.secondary.href} className={styles.ctaSecondary}>{P.cta.secondary.label}</Link>
              </div>
            </section>
          </Reveal>
        </div>
      </Container>
    </StoreLayout>
  );
}

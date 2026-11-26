"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "components/StoreLayout";
import { Container } from "components/layout/Container";
import { TopContentCard } from "components/common/TopContentCard";
import { Accordion } from "components/ui/Accordion";
import { CheckIcon, ArrowRightIcon } from "components/icons";
import { IMAGES } from "constants/images";
import {
  RING_SIZE_CHART,
  RING_SIZE_COUNTRIES,
  RING_SIZE_PAGE,
  findRowByCircumference,
  ringSizeChartCsv,
  sizeLabelFor,
  type RingSizeCountry,
  type RingSizeRow,
} from "constants/ringSize";
import { downloadTextFile } from "utility/downloadRingSizeChart";
import { Reveal } from "components/common/Reveal";
import styles from "./ring-size-guide.module.css";

type Mode = "mm" | "country";

const P = RING_SIZE_PAGE;

export default function RingSizeGuidePage() {
  const [mode, setMode] = useState<Mode>("country");
  const [mm, setMm] = useState("");
  const [country, setCountry] = useState<RingSizeCountry["id"]>("us");
  const [sizeLabel, setSizeLabel] = useState("");
  const [result, setResult] = useState<RingSizeRow | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");

  const sizeOptions = useMemo(
    () => Array.from(new Set(RING_SIZE_CHART.map((r) => sizeLabelFor(r, country)))),
    [country]
  );

  const find = () => {
    setError("");
    if (mode === "mm") {
      const row = findRowByCircumference(parseFloat(mm));
      if (!row) return setError("Enter your finger circumference in millimetres, e.g. 54.");
      return setResult(row);
    }
    const row = RING_SIZE_CHART.find((r) => sizeLabelFor(r, country) === sizeLabel);
    if (!row) return setError("Please choose a ring size.");
    setResult(row);
  };

  const columns = [
    { id: "us", label: "US / CA", show: ["all", "us"], value: (r: RingSizeRow) => r.us },
    { id: "uk", label: "UK / AU", show: ["all", "uk"], value: (r: RingSizeRow) => r.uk },
    { id: "eu", label: "EU (ISO)", show: ["all", "eu"], value: (r: RingSizeRow) => String(r.eu) },
    { id: "jp", label: "Japan", show: ["all", "jp"], value: (r: RingSizeRow) => String(r.jp) },
    { id: "d", label: "Diameter (mm)", show: ["all", "us", "uk", "eu", "jp"], value: (r: RingSizeRow) => r.diameter.toFixed(2) },
    { id: "c", label: "Circumference (mm)", show: ["all", "us", "uk", "eu", "jp"], value: (r: RingSizeRow) => r.circumference.toFixed(1) },
  ].filter((c) => c.show.includes(tab));

  return (
    <StoreLayout>
      <TopContentCard
        eyebrow={P.hero.eyebrow}
        title={P.hero.title}
        subtitle={P.hero.subtitle}
        image={IMAGES.jewelry.categories.rings}
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

          {/* CONVERTER */}
          <section id="size-converter" className={styles.section} aria-labelledby="converter-title">
            <Reveal>
              <header className={styles.sectionHead}>
                <span className={styles.eyebrow}>{P.converter.eyebrow}</span>
                <h2 id="converter-title" className={styles.sectionTitle}>{P.converter.title}</h2>
              </header>
            </Reveal>

            <Reveal className={styles.converter}>
              <div className={styles.converterFields}>
                <div className={`${styles.field} ${mode === "mm" ? styles.fieldActive : ""}`}>
                  <label htmlFor="rs-mm">{P.converter.byCircumference}</label>
                  <input
                    id="rs-mm"
                    inputMode="decimal"
                    placeholder="e.g. 54"
                    value={mm}
                    onFocus={() => setMode("mm")}
                    onChange={(e) => {
                      setMode("mm");
                      setMm(e.target.value);
                    }}
                  />
                </div>

                <span className={styles.or}>{P.converter.or}</span>

                <div className={`${styles.fieldGroup} ${mode === "country" ? styles.fieldActive : ""}`}>
                  <div className={styles.field}>
                    <label htmlFor="rs-country">{P.converter.countryLabel}</label>
                    <select
                      id="rs-country"
                      value={country}
                      onChange={(e) => {
                        setMode("country");
                        setCountry(e.target.value as RingSizeCountry["id"]);
                        setSizeLabel("");
                      }}
                    >
                      {RING_SIZE_COUNTRIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="rs-size">{P.converter.sizeLabel}</label>
                    <select
                      id="rs-size"
                      value={sizeLabel}
                      onChange={(e) => {
                        setMode("country");
                        setSizeLabel(e.target.value);
                      }}
                    >
                      <option value="">Select ring size</option>
                      {sizeOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="button" className={styles.findBtn} onClick={find}>
                  {P.converter.cta}
                </button>
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}

              {result && (
                <div className={styles.result} key={`${result.us}-${result.eu}`} aria-live="polite">
                  <p className={styles.resultMain}>
                    {P.converter.resultPrefix} <strong>{result.us} US</strong>
                  </p>
                  <div className={styles.resultGrid}>
                    <span><em>UK</em>{result.uk}</span>
                    <span><em>EU</em>{result.eu}</span>
                    <span><em>Japan</em>{result.jp}</span>
                    <span><em>Diameter</em>{result.diameter.toFixed(2)} mm</span>
                    <span><em>Circumference</em>{result.circumference.toFixed(1)} mm</span>
                  </div>
                  <Link href={P.converter.shopCta.href} className={styles.shopBtn}>
                    {P.converter.shopCta.label}
                  </Link>
                </div>
              )}

              <p className={styles.promo}>{P.converter.promo}</p>
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
              <div className={styles.chartBar}>
                <div className={styles.tabs} role="tablist" aria-label="Size scale">
                  {P.chart.tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <button type="button" className={styles.downloadBtn} onClick={() => downloadTextFile(ringSizeChartCsv(), "ring-size-chart.csv")}>
                  {P.converter.downloadCta}
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c.id}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RING_SIZE_CHART.map((row) => (
                      <tr key={row.us} className={result?.us === row.us ? styles.rowActive : ""}>
                        {columns.map((c) => (
                          <td key={c.id}>{c.value(row)}</td>
                        ))}
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
                  id: `ring-faq-${f.id}`,
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

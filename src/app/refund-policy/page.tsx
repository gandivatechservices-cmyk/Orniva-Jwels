"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { policiesService, type Policy } from "../../utility/services/policies";
import {
  ShieldCheckIcon,
  RefreshCwIcon,
  CheckIcon,
  InfoIcon,
  ArrowRightIcon,
  TruckIcon,
  ChevronDownIcon,
} from "../../components/icons";
import styles from "./refund-policy.module.css";

const FALLBACK_REFUND_POLICY: Policy = {
  _id: "refund-policy-fallback",
  slug: "refund-policy",
  title: "Refund & Return Policy",
  subtitle: "Customer satisfaction, returns eligibility, and food-safety hygiene standards",
  summary:
    "At Atlas, we want you to be happy with your purchase. Due to the nature of our food and grocery products, certain items may not be eligible for return.",
  sections: [
    {
      id: "returns",
      heading: "Returns",
      content:
        "For eligible unopened and non-perishable products, you may request a return within 30 days of receiving your order. Products must be unused, unopened, in their original packaging, and in a resalable condition. Please contact us before sending any item back.",
      items: [
        "Request return within 30 days of receiving your order",
        "Products must be unused, unopened, and in original packaging",
        "Must be in a resalable condition",
        "Please contact us before sending any item back",
      ],
    },
    {
      id: "food-grocery-products",
      heading: "Food & Grocery Products",
      content:
        "For food-safety and hygiene reasons, perishable, opened, or temperature-sensitive food and drink products generally cannot be returned. This does not affect your legal rights if an item is faulty, damaged, unsafe, incorrectly supplied, or not as described.",
      items: [
        "Bakery products",
        "Food products",
        "Drinks",
        "Indian grocery products",
        "Rice & grains",
        "Spices",
      ],
    },
    {
      id: "damaged-faulty-items",
      heading: "Damaged, Faulty or Incorrect Items",
      content:
        "Please check your order when it arrives. If you receive a damaged, faulty, incorrect, or missing item, please contact us as soon as possible at: returns@atlasone.com. Please provide your order number and photographs where appropriate. We will review the issue and provide an appropriate solution.",
      items: [
        "Check your order upon delivery",
        "Email returns@atlasone.com promptly",
        "Provide order number and clear photographs",
        "Fast resolution and review",
      ],
    },
    {
      id: "cancellations",
      heading: "Cancellations",
      content:
        "If you wish to cancel an order, please contact us as soon as possible at returns@atlasone.com. We will try to cancel your order before it is dispatched. Cancellation rights may vary depending on the type of product and applicable UK consumer law.",
      items: [
        "Contact returns@atlasone.com prior to dispatch",
        "Cancellation rights adhere to UK consumer laws",
      ],
    },
    {
      id: "refunds",
      heading: "Refunds",
      content:
        "Once an approved return or refund has been processed, the refund will normally be made to your original payment method. Please allow additional time for your bank or payment provider to process the refund.",
      items: [
        "Returned to original payment method (Visa, Mastercard, Apple Pay, etc.)",
        "Bank processing time may vary",
      ],
    },
    {
      id: "return-costs",
      heading: "Return Costs",
      content:
        "For eligible returns due to a change of mind, you may be responsible for return delivery costs unless otherwise stated. Where an item is faulty, damaged, or incorrectly supplied, return costs will be handled in accordance with applicable law.",
      items: [
        "Change of mind: customer may be responsible for return courier fees",
        "Faulty or damaged items: return delivery covered by Atlas",
      ],
    },
    {
      id: "exchanges",
      heading: "Exchanges",
      content:
        "Due to the nature of our products, we generally do not offer direct exchanges. Where appropriate, we may provide a replacement or refund.",
      items: [
        "Direct exchanges are not offered due to fresh food turnover",
        "Replacements or refunds provided where applicable",
      ],
    },
    {
      id: "contact-us",
      heading: "Contact Us",
      content:
        "Atlas\nEmail: returns@atlasone.com\nContact Number: 07771142324\nPlease include your order number when contacting us.\nYour statutory rights are not affected by this policy.",
      items: [
        "Company: Atlas",
        "Email: returns@atlasone.com",
        "Phone: 07771142324",
      ],
    },
  ],
  isActive: true,
  lastUpdated: new Date().toISOString(),
  metadata: {
    email: "returns@atlasone.com",
    phone: "07771142324",
  },
};

export default function RefundPolicyPage() {
  const [policy, setPolicy] = useState<Policy>(FALLBACK_REFUND_POLICY);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("returns");

  useEffect(() => {
    let isMounted = true;
    policiesService
      .getPolicyBySlug("refund-policy")
      .then((data) => {
        if (isMounted && data) {
          setPolicy(data);
        }
      })
      .catch(() => {
        // Fallback remains active if offline
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formattedDate = (() => {
    try {
      const d = new Date(policy.lastUpdated);
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return "Current";
    }
  })();

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <Container>
            <div className={styles.heroContent}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/" className={styles.breadcrumbLink}>
                  Home
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Refund & Return Policy</span>
              </nav>

              <div className={styles.heroBadge}>
                <ShieldCheckIcon size={14} />
                <span>Atlas Store Policy</span>
              </div>

              <h1 className={styles.heroTitle}>{policy.title}</h1>
              <p className={styles.heroSubtitle}>
                {policy.subtitle ||
                  "Clear guidelines on returns, refunds, cancellations, and food-safety hygiene standards."}
              </p>

              <div className={styles.heroMeta}>
                <div className={styles.metaItem}>
                  <RefreshCwIcon size={15} />
                  <span>30-Day Return Window (Unopened Goods)</span>
                </div>
                <div className={styles.metaItem}>
                  <TruckIcon size={15} />
                  <span>UK Consumer Protection Aligned</span>
                </div>
                <div className={styles.metaItem}>
                  <span>Last Updated: {formattedDate}</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* MAIN BODY GRID */}
        <Container>
          <div className={styles.mainGrid}>
            {/* STICKY SIDEBAR (DESKTOP) */}
            <aside className={styles.sidebar} aria-label="Table of contents">
              <div className={styles.sidebarTitle}>On this page</div>
              <ul className={styles.tocList}>
                {policy.sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className={`${styles.tocLink} ${activeSection === sec.id ? styles.active : ""}`}
                      onClick={() => setActiveSection(sec.id)}
                    >
                      <span className={styles.bulletDot} />
                      <span>{sec.heading}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className={styles.sidebarHelpBox}>
                <div className={styles.sidebarHelpH1}>Need help with an item?</div>
                <p className={styles.sidebarHelpP}>
                  Our UK customer support team is on standby to help resolve any damaged or missing items.
                </p>
                <a href="mailto:returns@atlasone.com" className={styles.sidebarHelpLink}>
                  <span>returns@atlasone.com</span>
                  <ArrowRightIcon size={13} />
                </a>
              </div>
            </aside>

            {/* CONTENT AREA */}
            <main className={styles.contentArea}>
              {/* TOP SUMMARY CARD */}
              <div className={styles.noticeCard}>
                <InfoIcon size={22} className={styles.noticeIcon} />
                <div className={styles.noticeText}>
                  <strong>Important Notice: </strong>
                  {policy.summary}
                </div>
              </div>

              {/* SECTIONS */}
              {policy.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={styles.sectionCard}
                >
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionHeading}>{section.heading}</h2>
                  </div>

                  <p className={styles.sectionParagraph}>
                    {section.content}
                  </p>

                  {section.items && section.items.length > 0 && (
                    <div className={styles.itemsGrid}>
                      {section.items.map((item, idx) => (
                        <div key={idx} className={styles.bulletItem}>
                          <span className={styles.bulletDot} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {/* DIRECT CONTACT SUPPORT CARD */}
              <section className={styles.contactCard} id="contact-us-card">
                <div className={styles.contactHeader}>
                  <div className={styles.contactIconCircle}>
                    <ShieldCheckIcon size={24} />
                  </div>
                  <div>
                    <h3 className={styles.contactTitle}>Contact Atlas Customer Care</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.875rem" }}>
                      Please provide your order reference number and photos of any damaged or incorrect items.
                    </p>
                  </div>
                </div>

                <div className={styles.contactGrid}>
                  <a href="mailto:returns@atlasone.com" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      ✉
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Email Us Directly</span>
                      <span className={styles.contactValue}>returns@atlasone.com</span>
                    </div>
                  </a>

                  <a href="tel:07771142324" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      📞
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Customer Helpline</span>
                      <span className={styles.contactValue}>07771142324</span>
                    </div>
                  </a>
                </div>

                <div className={styles.statutoryNote}>
                  Your statutory legal rights under the UK Consumer Rights Act 2015 are not affected by this policy.
                </div>
              </section>
            </main>
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { IMAGES } from "../../constants/images";
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
  title: "30-Day Luxury Return & Guarantee",
  subtitle: "Hallmarked purity, certified gemstones, and effortless 30-day returns",
  summary:
    "At LUXE JWELS, your complete satisfaction with your fine jewelry investment is our highest priority. We offer a transparent 30-day inspection and return policy on eligible collections.",
  sections: [
    {
      id: "returns",
      heading: "30-Day Easy Returns",
      content:
        "You may request a return within 30 days of receiving your jewelry order. Items must be unworn, undamaged, in their original presentation box with all security tags, lab certificates (IGI/GIA/BIS Hallmarking), and documentation intact.",
      items: [
        "30-day return window from the date of confirmed delivery",
        "Original LUXE JWELS velvet box and packaging included",
        "Security tamper-evident tag must remain attached",
        "Authenticity & diamond certification cards must be returned intact",
      ],
    },
    {
      id: "custom-engraved-pieces",
      heading: "Custom & Engraved Creations",
      content:
        "Bespoke designs, custom-sized rings, and personalized laser-engraved jewellery are crafted exclusively to your specifications and cannot be returned for a standard refund unless there is a verified manufacturing defect. Our master craftsmen will gladly resize or adjust your piece under our lifetime warranty program.",
      items: [
        "Personalized laser engravings",
        "Bespoke custom commissions",
        "Lifetime complimentary cleaning & prong inspection",
      ],
    },
    {
      id: "damaged-faulty-items",
      heading: "Damaged or Transit-Affected Deliveries",
      content:
        "Every shipment from LUXE JWELS is fully insured. In the unlikely event that your jewelry arrives damaged or missing an item, please notify our concierge team within 48 hours at returns@luxejwels.com with photos of the tamper-evident packaging.",
      items: [
        "Inspect your luxury package upon receipt",
        "Notify returns@luxejwels.com within 48 hours",
        "Complimentary insured courier collection arranged immediately",
      ],
    },
    {
      id: "cancellations",
      heading: "Order Cancellation",
      content:
        "Standard collection orders can be cancelled anytime before dispatch. Once dispatched via insured secure transport, the order will be delivered and can then be returned under our 30-Day Return Guarantee.",
      items: [
        "Instant cancellation prior to secure dispatch",
        "Prompt concierge assistance via chat or email",
      ],
    },
    {
      id: "refunds",
      heading: "Refund Processing & Method",
      content:
        "Upon receipt at our gemological lab, our quality specialists inspect the returned piece to verify certification and condition. Approved refunds are credited back to your original payment method within 5 to 7 business days.",
      items: [
        "Secure lab verification within 48 hours of receipt",
        "Direct refund to original payment card or UPI/NetBanking",
      ],
    },
    {
      id: "return-costs",
      heading: "Complimentary Insured Return Pickup",
      content:
        "For all certified fine jewelry orders above INR 2,999, LUXE JWELS provides complimentary insured return pickup via dedicated secure courier services. You will receive a tracking link and prepaid digital airway bill.",
      items: [
        "Free insured pickup for domestic orders",
        "Full door-to-door transit insurance coverage",
      ],
    },
    {
      id: "contact-us",
      heading: "Concierge Assistance",
      content:
        "LUXE JWELS Client Care\nEmail: returns@luxejwels.com\nConcierge: +91 98765 43210\nHours: Mon - Sat: 10:00 AM - 7:30 PM\nYour statutory consumer rights are fully preserved.",
      items: [
        "Brand: LUXE JWELS",
        "Email: returns@luxejwels.com",
        "Phone: +91 98765 43210",
      ],
    },
  ],
  isActive: true,
  lastUpdated: new Date().toISOString(),
  metadata: {
    email: "returns@luxejwels.com",
    phone: "+91 98765 43210",
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
        {/* TOP CONTENT HERO CARD */}
        <TopContentCard
          eyebrow="CLIENT CARE & GUARANTEE"
          title={policy.title}
          subtitle={
            policy.subtitle ||
            "Hallmarked purity, certified gemstones, and effortless 30-day inspection and returns."
          }
          image={IMAGES.jewelry.luxuryTrust}
          imageAlt="LUXE JWELS 30-Day Luxury Return Policy"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Refund & Return Policy" },
          ]}
          badge={
            <span className={styles.policyBadge}>
              Last Updated: {formattedDate}
            </span>
          }
          ariaLabel="Refund and Return Policy"
        />

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
                <div className={styles.sidebarHelpH1}>Need help with a return?</div>
                <p className={styles.sidebarHelpP}>
                  Our concierge team is on standby to assist with certificates, packaging, or insured courier collections.
                </p>
                <a href="mailto:returns@luxejwels.com" className={styles.sidebarHelpLink}>
                  <span>returns@luxejwels.com</span>
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
                    <h3 className={styles.contactTitle}>Contact LUXE JWELS Concierge</h3>
                    <p style={{ margin: "4px 0 0", color: "#77716A", fontSize: "0.875rem" }}>
                      Please provide your order reference number and inspection details for your fine jewelry piece.
                    </p>
                  </div>
                </div>

                <div className={styles.contactGrid}>
                  <a href="mailto:returns@luxejwels.com" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      ✉
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Email Us Directly</span>
                      <span className={styles.contactValue}>returns@luxejwels.com</span>
                    </div>
                  </a>

                  <a href="tel:+919876543210" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      📞
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Client Helpline</span>
                      <span className={styles.contactValue}>+91 98765 43210</span>
                    </div>
                  </a>
                </div>

                <div className={styles.statutoryNote}>
                  Your statutory legal rights and diamond authenticity certifications are fully preserved.
                </div>
              </section>
            </main>
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

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
  TruckIcon,
  CheckIcon,
  InfoIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from "../../components/icons";
import styles from "./terms.module.css";

const FALLBACK_TERMS_POLICY: Policy = {
  _id: "terms-fallback",
  slug: "terms-and-conditions",
  title: "Terms & Conditions",
  subtitle: "Terms of service, delivery policies, ordering conditions, and customer agreements",
  summary:
    "Welcome to LUXE JWELS. These Terms & Conditions govern your access to and purchase of our fine jewelry collections, certified diamond pieces, and bespoke atelier items.",
  sections: [
    {
      id: "introduction",
      heading: "1. Introduction & About Us",
      content:
        "These Terms and Conditions govern your use of the LUXE JWELS online boutique and the purchase of any handcrafted jewellery pieces from us. By placing an order with LUXE JWELS, you agree to be bound by these terms. LUXE JWELS is dedicated to creating exquisite, hallmarked gold and certified diamond jewellery crafted to perfection.",
      items: [
        "Applies to all visitors, registered patrons, and customers of LUXE JWELS",
        "Operated with highest standards of transparency and integrity",
      ],
    },
    {
      id: "account-eligibility",
      heading: "2. Eligibility & Customer Accounts",
      content:
        "To place an order with LUXE JWELS, you must possess a valid payment method acceptable to us. You are responsible for maintaining the confidentiality of your account credentials and ensuring that all details (including delivery address, postcode, and contact phone number) are accurate for secure courier transit.",
      items: [
        "Customers must be 18 years of age or older",
        "Accurate delivery address and contact telephone number required for high-value dispatch",
        "Account credentials must be kept confidential",
      ],
    },
    {
      id: "pricing-products",
      heading: "3. Product Descriptions, Certification & Pricing",
      content:
        "All prices displayed on our website are inclusive of applicable taxes. Every precious metal piece is BIS hallmarked and all diamonds and gemstones are verified by certified gemological institutions. Due to the handcrafted nature of our jewelry, slight variations in natural stone inclusions and metal finishing are hallmarks of unique craftsmanship.",
      items: [
        "All items feature official hallmarking and certificate cards",
        "Prices include all applicable taxes",
        "Unique handcrafted variations celebrate individual stone character",
      ],
    },
    {
      id: "delivery-terms",
      heading: "4. Insured Delivery Policy",
      content:
        "We provide complimentary, 100% insured courier delivery on fine jewelry orders. Every package is sealed in tamper-evident luxury presentation cases and dispatched with real-time GPS tracking.",
      items: [
        "Complimentary insured delivery on orders over £2,999",
        "Tamper-evident gift presentation packaging",
        "Dispatched via signature-required courier services",
      ],
    },
    {
      id: "returns-cancellations",
      heading: "5. 30-Day Easy Returns & Exchanges",
      content:
        "All returns and exchanges are governed by our Return Policy. Eligible unworn pieces in their original pristine condition with security tags and certificates intact may be returned within 30 days for a full refund or exchange.",
      items: [
        "30-day return policy on unworn jewelry with certificates",
        "Custom bespoke engravings or personalized items may be subject to inspection",
        "Complimentary lifetime cleaning and prong inspection service",
      ],
    },
    {
      id: "ordering-payments",
      heading: "6. Ordering & Secure Payments",
      content:
        "When you place an order, you will receive an order confirmation email once payment is confirmed. All transactions are processed through 256-bit encrypted checkout. We accept Visa, Mastercard, American Express, UPI, and PayPal.",
      items: [
        "Orders confirmed upon successful payment verification",
        "256-bit SSL encrypted secure checkout",
        "Accepted: Visa, Mastercard, Amex, UPI, PayPal",
      ],
    },
    {
      id: "promotions-coupons",
      heading: "7. Promotions, Discounts & Coupons",
      content:
        "Coupon codes, percentage discounts, and promotional free delivery incentives are subject to their respective terms and validity dates. Only one promotional code may be applied per order unless otherwise specified. Coupons cannot be redeemed for cash.",
      items: [
        "Discounts apply to qualifying items only",
        "Auto-applied discounts prioritize maximum shopper savings",
        "Promotions cannot be exchanged for cash",
      ],
    },
    {
      id: "liability-statutory-rights",
      heading: "8. Limitation of Liability & Statutory Rights",
      content:
        "Nothing in these Terms & Conditions excludes or limits our liability for death, personal injury caused by our negligence, fraud, or any statutory rights granted to consumers under the UK Consumer Rights Act 2015. Your statutory legal rights remain unaffected.",
      items: [
        "Full compliance with the UK Consumer Rights Act 2015",
        "Statutory legal consumer protections are fully preserved",
      ],
    },
    {
      id: "governing-law",
      heading: "9. Governing Law",
      content:
        "These Terms and Conditions shall be governed by and interpreted in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
      items: [
        "Governed by the laws of England and Wales",
        "Jurisdiction: Courts of England and Wales",
      ],
    },
    {
      id: "contact-atlas",
      heading: "10. Contact Information",
      content:
        "If you have questions regarding these terms, orders, or support:\nAtlas\nEmail: returns@atlasone.com\nTelephone: 07771142324\nPlease quote your order number for expedited support.",
      items: [
        "Atlas Groceries Customer Care",
        "Email: returns@atlasone.com",
        "Telephone: 07771142324",
      ],
    },
  ],
  isActive: true,
  lastUpdated: new Date().toISOString(),
  metadata: {
    freeDeliveryThreshold: 40,
    standardDeliveryFee: 4,
    email: "returns@atlasone.com",
    phone: "07771142324",
  },
};

export default function TermsPage() {
  const [policy, setPolicy] = useState<Policy>(FALLBACK_TERMS_POLICY);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("introduction");

  useEffect(() => {
    let isMounted = true;
    policiesService
      .getPolicyBySlug("terms-and-conditions")
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
          eyebrow="CLIENT CARE & AGREEMENT"
          title={policy.title}
          subtitle={
            policy.subtitle ||
            "Terms of service, delivery policies, ordering conditions, and customer agreements."
          }
          image={IMAGES.jewelry.luxuryTrust}
          imageAlt="LUXE JWELS Terms and Conditions"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Terms & Conditions" },
          ]}
          badge={
            <span className={styles.termsBadge}>
              Last Updated: {formattedDate}
            </span>
          }
          ariaLabel="Terms and Conditions"
        />

        {/* MAIN BODY GRID */}
        <Container>
          <div className={styles.mainGrid}>
            {/* STICKY SIDEBAR (DESKTOP) */}
            <aside className={styles.sidebar} aria-label="Table of contents">
              <div className={styles.sidebarTitle}>Table of Contents</div>
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
            </aside>

            {/* CONTENT AREA */}
            <main className={styles.contentArea}>
              {/* TOP SUMMARY CARD */}
              <div className={styles.noticeCard}>
                <InfoIcon size={22} className={styles.noticeIcon} />
                <div className={styles.noticeText}>
                  <strong>Terms Overview: </strong>
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
                    <h3 className={styles.contactTitle}>Need Clarification on Our Terms?</h3>
                    <p style={{ margin: "4px 0 0", color: "#77716A", fontSize: "0.875rem" }}>
                      Our concierge team is happy to assist with any questions regarding orders, delivery, or terms.
                    </p>
                  </div>
                </div>

                <div className={styles.contactGrid}>
                  <a href="mailto:returns@luxejwels.com" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      ✉
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Email Customer Care</span>
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
                  Your statutory legal rights and diamond authenticity certifications are fully respected.
                </div>
              </section>
            </main>
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

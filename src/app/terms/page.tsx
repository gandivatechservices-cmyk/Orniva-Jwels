"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
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
    "Welcome to Atlas Groceries. These Terms & Conditions govern your access to and use of our online grocery service, including all purchases made through our store.",
  sections: [
    {
      id: "introduction",
      heading: "1. Introduction & About Us",
      content:
        "These Terms and Conditions govern your use of the Atlas online grocery store (shop.atlassone.com) and the purchase of any products from us. By placing an order with Atlas, you agree to be bound by these terms. Atlas is dedicated to delivering fresh food, pantry staples, and specialty grocery products across the United Kingdom.",
      items: [
        "Applies to all visitors, registered shoppers, and customers of Atlas",
        "Operated under the laws of England and Wales",
      ],
    },
    {
      id: "account-eligibility",
      heading: "2. Eligibility & Customer Accounts",
      content:
        "To place an order with Atlas, you must be at least 18 years old and possess a valid payment method acceptable to us. You are responsible for maintaining the confidentiality of your account credentials and ensuring that all details (including delivery address, postcode, and contact phone number) are accurate.",
      items: [
        "Customers must be 18 years of age or older",
        "Accurate UK postal address and valid telephone number required",
        "Account credentials must be kept confidential",
      ],
    },
    {
      id: "pricing-products",
      heading: "3. Product Descriptions & Pricing",
      content:
        "All prices displayed on our website are in Pounds Sterling (GBP) and are inclusive of applicable UK VAT. While we make every effort to display accurate product details, ingredients, and imagery, fresh produce and packaged groceries may have slight visual variations. All products are subject to stock availability.",
      items: [
        "All transactions are conducted in GBP (£)",
        "Prices include UK VAT where applicable",
        "Perishable produce weights and appearances may vary naturally",
      ],
    },
    {
      id: "delivery-terms",
      heading: "4. Delivery Policy & Charges",
      content:
        "We provide dependable nationwide courier delivery across the United Kingdom. Our delivery rates are calculated automatically at checkout based on order value:\n• Free Delivery: Orders over £40 GBP qualify for FREE standard UK delivery.\n• Standard Delivery Fee: For orders under £40 GBP, a fixed delivery fee of £4 GBP is charged.\n• Delivery Timelines: Standard courier delivery is fulfilled within 2–3 business days with real-time tracking.\n• Access: Please ensure someone is available to receive perishable items. You may provide delivery instructions at checkout.",
      items: [
        "FREE Delivery on all orders over £40 GBP",
        "Standard delivery fee of £4 GBP on orders below £40 GBP",
        "Dispatched via tracked UK courier services within 2–3 business days",
        "Delivery instructions can be specified during the checkout process",
      ],
    },
    {
      id: "returns-cancellations",
      heading: "5. Cancellations, Returns & Refunds",
      content:
        "All returns, cancellations, and refunds are governed strictly by our Refund & Return Policy. Eligible non-perishable, unopened products in resalable condition may be returned within 30 days. Perishable food, bakery items, drinks, and temperature-sensitive groceries cannot be returned due to hygiene and health regulations, unless faulty or misdescribed.",
      items: [
        "30-day return policy on unopened, non-perishable goods",
        "Perishable food items are non-returnable for food-safety hygiene",
        "Report any damaged or missing items to returns@atlasone.com with photo evidence",
        "Cancellations must be requested prior to order dispatch",
      ],
    },
    {
      id: "ordering-payments",
      heading: "6. Ordering & Secure Payments",
      content:
        "When you place an order, you will receive an order confirmation email once payment is confirmed. All online card transactions are processed securely through 256-bit encrypted checkout powered by Stripe. We accept Visa, Mastercard, American Express, Apple Pay, and Google Pay.",
      items: [
        "Orders are confirmed upon successful payment verification",
        "Stripe 256-bit SSL encrypted checkout",
        "Accepted: Visa, Mastercard, Amex, Apple Pay, Google Pay",
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
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <Container>
            <div className={styles.heroContent}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/" className={styles.breadcrumbLink}>
                  Home
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>Terms & Conditions</span>
              </nav>

              <div className={styles.heroBadge}>
                <ShieldCheckIcon size={14} />
                <span>Customer Agreement</span>
              </div>

              <h1 className={styles.heroTitle}>{policy.title}</h1>
              <p className={styles.heroSubtitle}>
                {policy.subtitle ||
                  "Terms of service, delivery policies, ordering conditions, and customer agreements."}
              </p>

              <div className={styles.heroMeta}>
                <div className={styles.metaItem}>
                  <TruckIcon size={15} />
                  <span>Free Delivery Over £40 | £4 Under £40</span>
                </div>
                <div className={styles.metaItem}>
                  <RefreshCwIcon size={15} />
                  <span>30-Day Returns Policy</span>
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
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.875rem" }}>
                      Our team is happy to assist with any questions regarding orders, delivery, or terms.
                    </p>
                  </div>
                </div>

                <div className={styles.contactGrid}>
                  <a href="mailto:returns@atlasone.com" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      ✉
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Email Customer Care</span>
                      <span className={styles.contactValue}>returns@atlasone.com</span>
                    </div>
                  </a>

                  <a href="tel:07771142324" className={styles.contactMethod}>
                    <div className={styles.contactIconCircle}>
                      📞
                    </div>
                    <div className={styles.contactInfoText}>
                      <span className={styles.contactLabel}>Helpline</span>
                      <span className={styles.contactValue}>07771142324</span>
                    </div>
                  </a>
                </div>

                <div className={styles.statutoryNote}>
                  Your statutory legal rights under the UK Consumer Rights Act 2015 are fully respected.
                </div>
              </section>
            </main>
          </div>
        </Container>
      </div>
    </StoreLayout>
  );
}

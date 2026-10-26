"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "../Container";
import {
  AtlasLogo,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  TwitterIcon,
  TruckIcon,
  ShieldCheckIcon,
  LeafIcon,
  TagIcon,
  CheckIcon,
} from "../../icons";
import { useAuth } from "hooks";
import { catalogService, type Category } from "../../../utility/services/catalog";
import styles from "./Footer.module.css";

export function Footer({ className = "" }: { className?: string }) {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Use in-memory cached categories if available without initiating a network request
    const cached = catalogService.getCachedCategories();
    if (cached && cached.length > 0) {
      setCategories(cached.slice(0, 7));
    }
  }, []);

  const isAdmin = mounted && (user?.role === "admin" || user?.role === "superadmin");
  const isAuthed = mounted && isAuthenticated;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes("@")) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <footer className={`${styles.footer} ${className}`} aria-label="Store Footer">
      {/* 1. TOP VALUE PROPOSITION BANNER */}
      <div className={styles.trustBanner}>
        <Container>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <ShieldCheckIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>100% Authentic</span>
                <span className={styles.trustDesc}>Certified Jewellery</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <TruckIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>Secure Packaging</span>
                <span className={styles.trustDesc}>Safe & Elegant Presentation</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <TagIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>30-Day Easy Return</span>
                <span className={styles.trustDesc}>Hassle-Free Guarantee</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <LeafIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>Dedicated Support</span>
                <span className={styles.trustDesc}>We are here for you 24/7</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. NEWSLETTER STRIP */}
      <div className={styles.newsletterStrip}>
        <Container>
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterBrandBadge}>
              <span className={styles.newsletterBadgeTag}>100% AUTHENTIC</span>
              <span className={styles.newsletterBadgeSub}>Join our fine jewellery circle for private sales</span>
            </div>

            <div className={styles.newsletterFormWrap}>
              {newsletterSubscribed ? (
                <div className={styles.newsletterSuccess}>
                  <CheckIcon size={16} /> Thank you for subscribing to LUXE JWELS updates.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className={styles.newsletterInput}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    aria-label="Email address for jewelry updates"
                  />
                  <button type="submit" className={styles.newsletterBtn}>
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* 3. MAIN FOOTER CONTENT */}
      <div className={styles.mainSection}>
        <Container>
          <div className={styles.columnsGrid}>
            {/* BRAND COL */}
            <div className={styles.brandCol}>
              <AtlasLogo height={32} light />
              <p className={styles.tagline}>
                A legacy of trust, quality, and timeless designs. For over 25 years, we have been
                crafting exquisite fine jewellery that celebrates life’s most precious milestones.
              </p>

              <div className={styles.socialRow}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow LUXE JWELS on Facebook"
                >
                  <FacebookIcon size={16} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow LUXE JWELS on Instagram"
                >
                  <InstagramIcon size={16} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow LUXE JWELS on YouTube"
                >
                  <YoutubeIcon size={16} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow LUXE JWELS on X"
                >
                  <TwitterIcon size={16} />
                </a>
              </div>
            </div>

            {/* QUICK LINKS COL */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Quick Links</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/" prefetch={false} className={styles.link}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" prefetch={false} className={styles.link}>
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link href="/categories" prefetch={false} className={styles.link}>
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/about" prefetch={false} className={styles.link}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/manufacturing" prefetch={false} className={styles.link}>
                    Our Manufacturing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" prefetch={false} className={styles.link}>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* CUSTOMER CARE COL */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Customer Care</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/terms" prefetch={false} className={styles.link}>
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" prefetch={false} className={styles.link}>
                    Return & Refund
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" prefetch={false} className={styles.link}>
                    Customer Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/orders" prefetch={false} className={styles.link}>
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/terms" prefetch={false} className={styles.link}>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href={isAuthed ? "/account" : "/login"} prefetch={false} className={styles.link}>
                    {isAuthed ? "Account Settings" : "Sign In to Account"}
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link href="/admin/dashboard" prefetch={false} className={styles.link}>
                      Admin Console <span className={styles.linkBadge}>Admin</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* CONTACT US COL */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Contact Us</h3>
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Phone:</span>
                  <a href="tel:+919876543210" className={styles.contactLink}>
                    +91 98765 43210
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email:</span>
                  <a href="mailto:support@luxejewels.com" className={styles.contactLink}>
                    Support@luxejewels.com
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Boutique:</span>
                  <span className={styles.contactText}>Ahmedabad, Gujarat, India</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Hours:</span>
                  <span className={styles.contactText}>Mon – Sat: 10:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 4. BOTTOM LEGAL & PAYMENT METHODS BAR */}
      <div className={styles.bottomSection}>
        <Container>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              &copy; 2025 LUXE JWELS. All Rights Reserved.
            </p>

            <div className={styles.paymentMethods}>
              <span className={styles.payBadge}>VISA</span>
              <span className={styles.payBadge}>MasterCard</span>
              <span className={styles.payBadge}>UPI</span>
              <span className={styles.payBadge}>PayPal</span>
            </div>

            <div className={styles.legalLinks}>
              <Link href="/refund-policy" className={styles.legalLink}>
                Refund Policy
              </Link>
              <span className={styles.legalDivider}>•</span>
              <Link href="/terms" className={styles.legalLink}>
                Terms & Conditions
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

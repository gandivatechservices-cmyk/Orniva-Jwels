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
                <TruckIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>Free Express Delivery</span>
                <span className={styles.trustDesc}>On qualifying orders with live tracking</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <LeafIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>100% Fresh Guarantee</span>
                <span className={styles.trustDesc}>Locally sourced organic produce & groceries</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <ShieldCheckIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>Secure SSL Checkout</span>
                <span className={styles.trustDesc}>256-bit encrypted card & contactless pay</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <TagIcon size={22} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>Direct Store Offers</span>
                <span className={styles.trustDesc}>Automatic discounts & verified weekly coupons</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className={styles.mainSection}>
        <Container>
          <div className={styles.columnsGrid}>
            {/* BRAND COL */}
            <div className={styles.brandCol}>
              <AtlasLogo height={30} light />
              <p className={styles.tagline}>
                Fresh groceries, pantry staples, and gourmet foods delivered direct to your doorstep.
                Dedicated to quality, sustainability, and exceptional taste.
              </p>

              <div className={styles.socialRow}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow Atlas on Facebook"
                >
                  <FacebookIcon size={16} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow Atlas on Instagram"
                >
                  <InstagramIcon size={16} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow Atlas on YouTube"
                >
                  <YoutubeIcon size={16} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label="Follow Atlas on X"
                >
                  <TwitterIcon size={16} />
                </a>
              </div>
            </div>

            {/* DYNAMIC CATEGORIES COL */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Fresh Categories</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/products" prefetch={false} className={styles.link}>
                    All Groceries
                  </Link>
                </li>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        href={cat.slug ? `/category/${cat.slug}` : `/products?category=${cat._id}`}
                        prefetch={false}
                        className={styles.link}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link href="/products" prefetch={false} className={styles.link}>
                        Fresh Produce
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" prefetch={false} className={styles.link}>
                        Dairy & Eggs
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" prefetch={false} className={styles.link}>
                        Bakery & Pantry
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link href="/products?offers=true" prefetch={false} className={styles.link}>
                    Special Offers <span className={styles.linkBadge}>Deals</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* CUSTOMER CARE & ACCOUNT COL */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Customer Care</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/cart" prefetch={false} className={styles.link}>
                    Shopping Basket
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" prefetch={false} className={styles.link}>
                    My Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/orders" prefetch={false} className={styles.link}>
                    Track Your Orders
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" prefetch={false} className={styles.link}>
                    Refund & Return Policy
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

            {/* STOREFRONT & NEWSLETTER COL */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Storefronts & Updates</h3>
              <p className={styles.storeInfoText}>
                Active regional distribution centers serving fresh groceries.
              </p>

              {/* Interactive Newsletter Form */}
              <div className={styles.newsletterBox}>
                <span className={styles.newsletterTitle}>Get Weekly Deals & Recipes</span>
                {newsletterSubscribed ? (
                  <span className={styles.newsletterSuccess}>
                    <CheckIcon size={14} /> You&apos;re subscribed to weekly fresh deals!
                  </span>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className={styles.newsletterInput}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      aria-label="Email address for newsletter"
                    />
                    <button type="submit" className={styles.newsletterBtn}>
                      Join
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 3. BOTTOM LEGAL & REGIONAL BAR */}
      <div className={styles.bottomSection}>
        <Container>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              &copy; {currentYear} Atlas Groceries. All rights reserved. Source of truth backed by
              Atlas Cloud API.
            </p>

            <div className={styles.legalLinks}>
              <Link href="/refund-policy" className={styles.legalLink}>
                Refund & Return Policy
              </Link>
              <span className={styles.legalDivider}>•</span>
              <Link href="/terms" className={styles.legalLink}>
                Terms & Conditions
              </Link>
              <span className={styles.legalDivider}>•</span>
              <Link href="/products" className={styles.legalLink}>
                Privacy Policy
              </Link>
            </div>

            <div className={styles.activeStoreBadge}>
              <span className={styles.statusIndicator} />
              <span>Store Online • UK Wide</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

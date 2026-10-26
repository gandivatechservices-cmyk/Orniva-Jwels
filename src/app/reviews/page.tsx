"use client";

import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { StarIcon, CheckIcon } from "../../components/icons";
import { IMAGES } from "../../constants/images";
import styles from "./reviews.module.css";

const REVIEWS_DATA = [
  {
    name: "Pooja S.",
    city: "Ahmedabad",
    rating: 5,
    title: "Mesmerizing diamond solitaire ring",
    text: "The quality is simply outstanding! The certification documents arrived sealed with the ring and the sparkle in sunlight is breathtaking. Delivered within 48 hours to my doorstep.",
    date: "14 Oct 2026",
  },
  {
    name: "Rahul M.",
    city: "Surat",
    rating: 5,
    title: "Heirloom bridal necklace set",
    text: "Purchased the bridal emerald & diamond drop necklace for my wedding. Exceptional hallmarked craftsmanship and customer care. The team patiently answered all my queries.",
    date: "02 Oct 2026",
  },
  {
    name: "Neha K.",
    city: "Rajkot",
    rating: 5,
    title: "Pure elegance and prompt service",
    text: "Best place to purchase certified diamond jewelry online. The packaging in the velvet box was so luxurious. 10/10 recommendation!",
    date: "28 Sep 2026",
  },
  {
    name: "Ananya D.",
    city: "Mumbai",
    rating: 5,
    title: "Exquisite diamond tennis bracelet",
    text: "The diamonds are beautifully matched with brilliant clarity. The safety clasp is very secure and comfortable for everyday luxury wear.",
    date: "19 Sep 2026",
  },
];

const GALLERY_PHOTOS = [
  IMAGES.jewelry.categories.rings,
  IMAGES.jewelry.designerPromo,
  IMAGES.jewelry.customPromo,
  IMAGES.jewelry.categories.earrings,
];

export default function ReviewsPage() {
  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        {/* HERO BANNER */}
        <section className={styles.heroBanner} aria-label="Customer Reviews">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES.jewelry.heroModel}
            alt="Happy customer wearing luxury jewelry"
            className={styles.heroBg}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Happy Customers</h1>
            <p className={styles.heroSubtitle}>Real Stories &bull; Genuine Reviews &bull; Lasting Trust</p>
          </div>
        </section>

        <Container>
          <div className={styles.reviewsLayout}>
            {/* LEFT: 4.8 / 5 RATING SUMMARY */}
            <div className={styles.ratingSummaryCard}>
              <div>
                <h2 className={styles.scoreBig}>4.8 / 5</h2>
                <div className={styles.scoreSub}>Based on 1,248 verified patron reviews</div>
              </div>

              <div className={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size={20} filled />
                ))}
              </div>

              <div className={styles.distributionRows}>
                <div className={styles.distRow}>
                  <span>5 ★</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: "88%" }} /></div>
                  <span className={styles.distPct}>88%</span>
                </div>
                <div className={styles.distRow}>
                  <span>4 ★</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: "9%" }} /></div>
                  <span className={styles.distPct}>9%</span>
                </div>
                <div className={styles.distRow}>
                  <span>3 ★</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: "2%" }} /></div>
                  <span className={styles.distPct}>2%</span>
                </div>
                <div className={styles.distRow}>
                  <span>2 ★</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: "1%" }} /></div>
                  <span className={styles.distPct}>1%</span>
                </div>
                <div className={styles.distRow}>
                  <span>1 ★</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: "0%" }} /></div>
                  <span className={styles.distPct}>0%</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#242321", display: "block", marginBottom: 6 }}>
                  Share Your Experience
                </span>
                <p style={{ fontSize: "0.75rem", color: "#77716A", margin: "0 0 14px 0", lineHeight: 1.4 }}>
                  Write a review and inspire others to discover their dream piece.
                </p>
                <button
                  type="button"
                  className={styles.writeReviewBtn}
                  onClick={() => alert("Thank you! Review submission form will open.")}
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* RIGHT: REVIEWS LIST */}
            <div className={styles.reviewsList}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#242321", margin: "0 0 8px 0" }}>
                What Our Customers Say
              </h2>

              {REVIEWS_DATA.map((r, idx) => (
                <div key={idx} className={styles.reviewCard}>
                  <div className={styles.reviewTop}>
                    <div className={styles.reviewer}>
                      <div className={styles.reviewerAvatar}>{r.name.charAt(0)}</div>
                      <div>
                        <div className={styles.reviewerName}>{r.name} &bull; {r.city}</div>
                        <div className={styles.verifiedBadge}>
                          <CheckIcon size={12} style={{ display: "inline", marginRight: 4 }} />
                          Verified Buyer
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={styles.starsRow}>
                        {[...Array(r.rating)].map((_, i) => (
                          <StarIcon key={i} size={13} filled />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#A39B92" }}>{r.date}</span>
                    </div>
                  </div>

                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#242321", margin: 0 }}>
                    {r.title}
                  </h4>
                  <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* #LUXEJEWELS GALLERY */}
          <section className={styles.gallerySection} style={{ marginTop: 60 }} aria-label="#LuxeJewels Gallery">
            <div className={styles.galleryHeader}>
              <h3 className={styles.galleryTitle}>#LuxeJewels on Instagram</h3>
              <p style={{ color: "#77716A", margin: 0, fontSize: "0.9rem" }}>Tag us in your moments of timeless elegance</p>
            </div>

            <div className={styles.galleryGrid}>
              {GALLERY_PHOTOS.map((img, i) => (
                <div key={i} className={styles.galleryCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="Customer wearing Luxe Jewels" className={styles.galleryImg} />
                </div>
              ))}
            </div>
          </section>
        </Container>
      </div>
    </StoreLayout>
  );
}

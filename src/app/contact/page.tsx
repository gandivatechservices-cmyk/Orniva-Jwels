"use client";

import { useState } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { MapPinIcon, ShieldCheckIcon } from "../../components/icons";
import { IMAGES } from "../../constants/images";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <StoreLayout>
      <div className={styles.pageContainer}>
        <TopContentCard
          title="Get in Touch"
          subtitle="We're here to help you find your dream jewellery piece"
          image={IMAGES.jewelry.customPromo}
          imageAlt="Jeweler crafting bespoke piece"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
          ariaLabel="Get In Touch"
        />

        <Container>
          <div className={styles.contactGrid}>
            {/* LEFT: INFO CARDS */}
            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>Phone Concierge</h3>
                  <span className={styles.infoValue}>+91 98765 43210</span>
                  <span className={styles.infoSub}>Mon &ndash; Sat 10:00 AM &ndash; 7:00 PM</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>Email Concierge</h3>
                  <span className={styles.infoValue}>support@luxejewels.com</span>
                  <span className={styles.infoSub}>Online response within 4 hours</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <MapPinIcon size={20} />
                </div>
                <div className={styles.infoContent}>
                  <h3 className={styles.infoTitle}>Flagship Atelier</h3>
                  <span className={styles.infoValue}>Ahmedabad, Gujarat, India</span>
                  <span className={styles.infoSub}>By Appointment &bull; Private Consultations</span>
                </div>
              </div>
            </div>

            {/* RIGHT: MESSAGE FORM */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>

              {submitted ? (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <ShieldCheckIcon size={44} style={{ color: "#A77B3F", margin: "0 auto 12px" }} />
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "#242321", margin: 0 }}>
                    Message Received
                  </h3>
                  <p style={{ color: "#77716A", fontSize: "0.9rem", margin: "8px 0 0" }}>
                    Thank you, {formData.name || "valued guest"}. Our bespoke jewelry concierge will get in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      className={styles.input}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      className={styles.input}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullRow}`}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      className={styles.input}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullRow}`}>
                    <label className={styles.label}>How can we assist you? *</label>
                    <textarea
                      required
                      placeholder="Tell us about the design, gemstone, or consultation you are looking for..."
                      className={styles.textarea}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div className={styles.fullRow}>
                    <button type="submit" className={styles.sendBtn}>
                      Send Message &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* MAP SECTION */}
          <section style={{ marginTop: 48 }} aria-label="Location Map">
            <div className={styles.mapBox}>
              <div style={{ textAlign: "center", padding: 20 }}>
                <MapPinIcon size={32} style={{ color: "#A77B3F", margin: "0 auto 8px" }} />
                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#242321", margin: 0 }}>
                  LUXE JWELS Flagship Atelier
                </h4>
                <p style={{ color: "#77716A", fontSize: "0.85rem", margin: "4px 0 0" }}>
                  Ahmedabad, Gujarat &bull; Private Viewings by Appointment
                </p>
              </div>
            </div>
          </section>
        </Container>
      </div>
    </StoreLayout>
  );
}

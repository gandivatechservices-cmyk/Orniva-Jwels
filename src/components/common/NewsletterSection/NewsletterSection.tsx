"use client";

import { useState } from "react";
import { DiamondIcon, MailIcon, CheckIcon } from "../../icons";
import styles from "./NewsletterSection.module.css";

export function NewsletterSection({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className={`${styles.banner} ${className}`} aria-label="Newsletter Signup">
      {/* LEFT CONTENT */}
      <div className={styles.left}>
        <div className={styles.leafIconWrap} aria-hidden="true">
          <DiamondIcon size={20} className={styles.leafIcon} />
        </div>
        <div className={styles.textGroup}>
          <h3 className={styles.title}>Join The LUXE JWELS Circle</h3>
          <p className={styles.subtitle}>
            Receive privileged previews of fine jewelry launches, private salon events &amp; bespoke creations.
          </p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className={styles.formContainer}>
        {submitted ? (
          <div className={styles.successCard} role="status">
            <div className={styles.successIconCircle}>
              <CheckIcon size={16} />
            </div>
            <div>
              <strong className={styles.successTitle}>You&apos;re subscribed!</strong>
              <p className={styles.successSubtitle}>
                Welcome to our private circle. Look out for our welcome message.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formBar}>
            <span className={styles.mailIcon} aria-hidden="true">
              <MailIcon size={18} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={styles.input}
              required
              aria-label="Email address for newsletter"
            />
            <button type="submit" className={styles.submitBtn}>
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

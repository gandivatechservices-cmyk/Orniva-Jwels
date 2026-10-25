"use client";

import { TruckIcon, BoxIcon, ShieldCheckIcon, RefreshCwIcon } from "../../icons";
import styles from "./ServiceBenefits.module.css";

const DEFAULT_BENEFITS = [
  {
    icon: <TruckIcon size={22} />,
    title: "Free Delivery",
    subtitle: "On orders over £40",
  },
  {
    icon: <BoxIcon size={22} />,
    title: "Wide Range",
    subtitle: "10,000+ products",
  },
  {
    icon: <ShieldCheckIcon size={22} />,
    title: "Secure Payments",
    subtitle: "100% secure checkout",
  },
  {
    icon: <RefreshCwIcon size={22} />,
    title: "Easy Returns",
    subtitle: "Hassle-free returns",
  },
];

export function ServiceBenefits({ className = "" }: { className?: string }) {
  return (
    <section className={`${styles.wrapper} ${className}`} aria-label="Store Benefits & Guarantees">
      <div className={styles.grid}>
        {DEFAULT_BENEFITS.map((item) => (
          <div key={item.title} className={styles.item}>
            <div className={styles.iconCircle} aria-hidden="true">
              {item.icon}
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.subtitle}>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


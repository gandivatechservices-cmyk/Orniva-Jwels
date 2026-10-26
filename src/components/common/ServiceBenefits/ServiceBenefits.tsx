"use client";

import { TruckIcon, ShieldCheckIcon, RefreshCwIcon, DiamondIcon } from "../../icons";
import styles from "./ServiceBenefits.module.css";

const DEFAULT_BENEFITS = [
  {
    icon: <TruckIcon size={20} />,
    title: "Free Shipping",
    subtitle: "On orders above £2,999",
  },
  {
    icon: <RefreshCwIcon size={20} />,
    title: "30 Days Easy Return",
    subtitle: "Hassle Free",
  },
  {
    icon: <DiamondIcon size={20} />,
    title: "Certified Jewellery",
    subtitle: "100% Authentic",
  },
  {
    icon: <ShieldCheckIcon size={20} />,
    title: "Secure Payments",
    subtitle: "Multiple Options",
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

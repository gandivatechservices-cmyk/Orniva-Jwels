"use client";

import type { Coupon } from "utility/services/offers";
import { formatPrice } from "utility/formatMoney";
import styles from "./OffersSection.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function headline(offer: Coupon, currency: string): string {
  switch (offer.discountType) {
    case "percent":
      return `${offer.discountValue ?? 0}% OFF`;
    case "fixed":
      return `${formatPrice(offer.fixedAmountByCurrency?.[currency] ?? offer.discountValue ?? 0, currency)} OFF`;
    case "free_shipping":
      return "FREE DELIVERY";
    case "buy_x_get_y":
      return offer.bxgy ? `BUY ${offer.bxgy.buyQuantity} GET ${offer.bxgy.getQuantity}` : "BUY X GET Y";
  }
}

function conditions(offer: Coupon, currency: string): string[] {
  const list: string[] = [];
  if (offer.minCartValue) list.push(`Min. spend ${formatPrice(offer.minCartValue, currency)}`);
  if (offer.minQuantity) list.push(`Min. ${offer.minQuantity} items`);
  if (offer.maxDiscountAmount) list.push(`Up to ${formatPrice(offer.maxDiscountAmount, currency)} off`);
  if (offer.daysOfWeek?.length) list.push(offer.daysOfWeek.map((d) => DAYS[d]).join(", "));
  if (offer.timeWindow) list.push(`${offer.timeWindow.startHour}:00–${offer.timeWindow.endHour}:00`);
  if (offer.eligibility === "new_customers") list.push("New customers only");
  list.push(`Ends ${new Date(offer.validTo).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`);
  return list;
}

type Props = { offers: Coupon[]; currencyByDomain: Record<string, string> };

export function OffersSection({ offers, currencyByDomain }: Props) {
  if (offers.length === 0) return null;
  return (
    <section className={styles.section} aria-label="Current offers">
      <div className={styles.grid}>
        {offers.map((offer) => {
          const currency = currencyByDomain[offer.domainId] || "GBP";
          return (
            <article key={offer._id} className={styles.card}>
              <span className={styles.headline}>{headline(offer, currency)}</span>
              <p className={styles.description}>{offer.description}</p>
              <ul className={styles.conditions}>
                {conditions(offer, currency).map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

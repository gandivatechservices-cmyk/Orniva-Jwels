"use client";

import { useState } from "react";
import { useCart } from "hooks";
import { Button } from "components/ui/Button";
import { TagIcon, CheckIcon } from "components/icons";
import styles from "./CouponInput.module.css";

const REASON_MESSAGES: Record<string, string> = {
  not_found: "Coupon code not found.",
  inactive: "This promotion is no longer active.",
  not_yet_active: "This promotion has not started yet.",
  expired: "This coupon code has expired.",
  usage_limit_reached: "This code has reached its maximum redemption limit.",
  already_used: "You have already used this coupon code on a prior order.",
  not_eligible: "Your account is not eligible for this exclusive promotion.",
  min_cart_not_met: "Add more items to your basket to meet the minimum spend requirement.",
  min_quantity_not_met: "You need more qualifying items in your basket to use this code.",
  cart_not_exclusive_to_offer: "This exclusive coupon only applies when your basket contains exclusively qualifying items.",
  no_eligible_items: "None of the items in your basket qualify for this offer.",
  buy_quantity_not_met: "Add more qualifying items to unlock this Buy-X-Get-Y offer.",
  day_not_eligible: "This promotion is not available today.",
  time_not_eligible: "This promotion is not active at this hour.",
  misconfigured: "This promotion is currently unavailable.",
};

export function CouponInput() {
  const { couponCode, couponResult, couponLoading, applyCoupon, removeCoupon } = useCart();
  const [draft, setDraft] = useState("");

  const handleApply = async () => {
    const code = draft.trim();
    if (!code) return;
    await applyCoupon(code);
    setDraft("");
  };

  const isManualCoupon = Boolean(couponResult?.valid && couponCode && couponCode !== "AUTO_OFFER");
  const isAutoOffer = Boolean(couponResult?.valid && (!couponCode || couponCode === "AUTO_OFFER"));

  return (
    <div className={styles.wrapper}>
      {isManualCoupon ? (
        <div className={styles.success}>
          <div className={styles.successContent}>
            <CheckIcon size={16} />
            <span>
              Coupon <strong>{couponCode}</strong> applied!
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={removeCoupon} className={styles.removeBtn}>
            Remove
          </Button>
        </div>
      ) : (
        <>
          {isAutoOffer && couponResult?.valid && (
            <div className={styles.autoOfferNotice}>
              <TagIcon size={15} />
              <span>
                Deal applied: <strong>{couponResult.coupon?.description || "Auto discount"}</strong>
              </span>
            </div>
          )}
          <div className={styles.row}>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter promo code"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              isLoading={couponLoading}
              disabled={!draft.trim()}
            >
              Apply
            </Button>
          </div>
          {couponResult && !couponResult.valid && (
            <span className={styles.error}>
              {REASON_MESSAGES[couponResult.reason] || "This code cannot be applied to your basket."}
            </span>
          )}
        </>
      )}
    </div>
  );
}

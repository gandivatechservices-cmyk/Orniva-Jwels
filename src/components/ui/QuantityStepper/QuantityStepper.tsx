import { memo } from "react";
import { MinusIcon, PlusIcon } from "components/icons";
import type { QuantityStepperProps } from "./types";
import styles from "./QuantityStepper.module.css";

export const QuantityStepper = memo(function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  size = "md",
  disabled = false,
  className = "",
  ariaLabel = "Product quantity",
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(Math.min(max, value + step));
  };

  return (
    <div
      className={`
        ${styles.stepper}
        ${styles[size]}
        ${disabled ? styles.disabled : ""}
        ${className}
      `}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`${styles.button} ${styles.decrementBtn}`}
      >
        <MinusIcon size={size === "sm" ? 14 : 16} />
      </button>

      <span className={styles.value} aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`${styles.button} ${styles.incrementBtn}`}
      >
        <PlusIcon size={size === "sm" ? 14 : 16} />
      </button>
    </div>
  );
});

import { forwardRef } from "react";
import type { RadioCardProps } from "./types";
import styles from "./RadioCard.module.css";

export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  { title, description, icon, badge, rightSlot, checked, disabled, className = "", id, ...props },
  ref
) {
  const cardId = id || (typeof title === "string" ? title.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={cardId}
      className={`
        ${styles.card}
        ${checked ? styles.checked : ""}
        ${disabled ? styles.disabled : ""}
        ${className}
      `}
    >
      <input
        ref={ref}
        id={cardId}
        type="radio"
        checked={checked}
        disabled={disabled}
        className={styles.nativeInput}
        {...props}
      />
      <div className={styles.radioVisual}>
        <span className={styles.radioCircle}>
          <span className={styles.radioDot} />
        </span>
      </div>

      {icon && <div className={styles.iconSlot}>{icon}</div>}

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
        {description && <div className={styles.description}>{description}</div>}
      </div>

      {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
    </label>
  );
});

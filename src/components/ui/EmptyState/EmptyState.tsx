import Link from "next/link";
import { BoxIcon, DiamondIcon, HeartIcon, InfoIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "components/icons";
import { EMPTY_STATE_PRESETS, type EmptyStateIconName, type EmptyStatePreset } from "constants/emptyStates";
import type { EmptyStateProps } from "./types";
import styles from "./EmptyState.module.css";

const ICON_SIZE = 34;

const ICONS: Record<EmptyStateIconName, () => React.ReactElement> = {
  bag: () => <ShoppingBagIcon size={ICON_SIZE} />,
  heart: () => <HeartIcon size={ICON_SIZE} />,
  orders: () => <BoxIcon size={ICON_SIZE} />,
  search: () => <SearchIcon size={ICON_SIZE} />,
  user: () => <UserIcon size={ICON_SIZE} />,
  alert: () => <InfoIcon size={ICON_SIZE} />,
  diamond: () => <DiamondIcon size={ICON_SIZE} />,
};

/** Reusable empty / error screen. Pick a `preset` for ready-made jewellery copy, or pass your own props. */
export function EmptyState({
  preset,
  title,
  description,
  iconName,
  icon,
  action,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  className = "",
}: EmptyStateProps) {
  const base: Partial<EmptyStatePreset> = preset ? EMPTY_STATE_PRESETS[preset] : EMPTY_STATE_PRESETS.generic;

  const finalTitle = title ?? base.title;
  const finalDescription = description ?? base.description;
  const finalIcon = icon ?? ICONS[iconName ?? base.icon ?? "diamond"]();
  const primaryLabel = actionLabel ?? base.actionLabel;
  const primaryHref = actionHref ?? (actionLabel ? undefined : base.actionHref);
  const secLabel = secondaryLabel ?? base.secondaryLabel;
  const secHref = secondaryHref ?? base.secondaryHref;

  let primary = action;
  if (!primary && primaryLabel) {
    if (primaryHref) {
      primary = (
        <Link href={primaryHref} className={styles.primaryBtn}>
          {primaryLabel}
        </Link>
      );
    } else if (onAction) {
      primary = (
        <button type="button" onClick={onAction} className={styles.primaryBtn}>
          {primaryLabel}
        </button>
      );
    }
  }

  return (
    <div className={`${styles.container} ${className}`} role="status">
      <div className={styles.iconWrap} aria-hidden="true">
        <span className={styles.halo} />
        <span className={styles.iconCircle}>{finalIcon}</span>
        <span className={`${styles.spark} ${styles.spark1}`} />
        <span className={`${styles.spark} ${styles.spark2}`} />
      </div>

      <h3 className={styles.title}>{finalTitle}</h3>
      {finalDescription && <p className={styles.description}>{finalDescription}</p>}

      {(primary || (secLabel && secHref)) && (
        <div className={styles.actions}>
          {primary}
          {secLabel && secHref && (
            <Link href={secHref} className={styles.secondaryLink}>
              {secLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

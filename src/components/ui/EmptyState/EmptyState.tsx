import Link from "next/link";
import { BoxIcon } from "components/icons";
import type { EmptyStateProps } from "./types";
import styles from "./EmptyState.module.css";

export function EmptyState({
  title = "No items found",
  description = "There are no records to display at this time.",
  icon = <BoxIcon size={48} className={styles.defaultIcon} />,
  action,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  let renderedAction = action;

  if (!renderedAction && actionLabel) {
    if (actionHref) {
      renderedAction = (
        <Link href={actionHref} className={styles.actionBtn}>
          {actionLabel}
        </Link>
      );
    } else if (onAction) {
      renderedAction = (
        <button type="button" onClick={onAction} className={styles.actionBtn}>
          {actionLabel}
        </button>
      );
    }
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.iconSlot}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {renderedAction && <div className={styles.actionSlot}>{renderedAction}</div>}
    </div>
  );
}

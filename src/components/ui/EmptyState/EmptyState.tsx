import { BoxIcon } from "components/icons";
import type { EmptyStateProps } from "./types";
import styles from "./EmptyState.module.css";

export function EmptyState({
  title = "No items found",
  description = "There are no records to display at this time.",
  icon = <BoxIcon size={48} className={styles.defaultIcon} />,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.iconSlot}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.actionSlot}>{action}</div>}
    </div>
  );
}

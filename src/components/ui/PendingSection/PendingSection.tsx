import { SparklesIcon } from "components/icons";
import { Badge } from "components/ui/Badge";
import type { PendingSectionProps } from "./types";
import styles from "./PendingSection.module.css";

export function PendingSection({
  title,
  subtitle,
  pendingFeature,
  icon = <SparklesIcon size={24} className={styles.icon} />,
  children,
  className = "",
}: PendingSectionProps) {
  const displaySubtitle =
    subtitle ||
    (pendingFeature
      ? `This section will activate once the ${pendingFeature} is connected.`
      : "This section will activate once its dedicated backend service and data endpoints are connected.");

  return (
    <div className={`${styles.pendingContainer} ${className}`} aria-label={`${title} - Coming soon`}>
      <div className={styles.headerRow}>
        <div className={styles.iconWrap}>{icon}</div>
        <div className={styles.textWrap}>
          <div className={styles.titleRow}>
            <h4 className={styles.title}>{title}</h4>
            <Badge variant="primary" size="sm">Coming Soon</Badge>
          </div>
          {displaySubtitle && <p className={styles.subtitle}>{displaySubtitle}</p>}
        </div>
      </div>
      {children && <div style={{ marginTop: "16px" }}>{children}</div>}
    </div>
  );
}

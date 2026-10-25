import { AlertCircleIcon } from "components/icons";
import { Button } from "components/ui/Button";
import type { ErrorStateProps } from "./types";
import styles from "./ErrorState.module.css";

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this content. Please try again.",
  onRetry,
  retryText = "Try again",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`${styles.container} ${className}`} role="alert">
      <div className={styles.iconSlot}>
        <AlertCircleIcon size={44} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {onRetry && (
        <div className={styles.actionSlot}>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryText}
          </Button>
        </div>
      )}
    </div>
  );
}

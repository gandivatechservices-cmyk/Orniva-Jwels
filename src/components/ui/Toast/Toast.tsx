import { CheckIcon, AlertCircleIcon, InfoIcon, CloseIcon } from "components/icons";
import type { ToastProps } from "./types";
import styles from "./Toast.module.css";

export function Toast({
  id,
  message,
  variant = "info",
  onClose,
  className = "",
}: ToastProps) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckIcon size={16} />;
      case "error":
        return <AlertCircleIcon size={16} />;
      default:
        return <InfoIcon size={16} />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${styles.toast} ${styles[variant]} ${className}`}
    >
      <span className={styles.iconWrap}>{getIcon()}</span>
      <span className={styles.message}>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={() => onClose(id)}
          aria-label="Dismiss notification"
          className={styles.closeBtn}
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}

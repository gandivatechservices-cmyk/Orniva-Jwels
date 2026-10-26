import type { ReactNode } from "react";

export type EmptyStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

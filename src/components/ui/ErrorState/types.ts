import type { ReactNode } from "react";

export type ErrorStateProps = {
  title?: ReactNode;
  message?: ReactNode;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
};

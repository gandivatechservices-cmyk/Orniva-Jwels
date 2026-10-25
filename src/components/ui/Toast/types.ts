import type { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastProps = {
  id: string;
  message: ReactNode;
  variant?: ToastVariant;
  onClose?: (id: string) => void;
  className?: string;
};

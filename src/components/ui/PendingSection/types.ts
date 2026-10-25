import type { ReactNode } from "react";

export type PendingSectionProps = {
  title: string;
  subtitle?: string;
  pendingFeature?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

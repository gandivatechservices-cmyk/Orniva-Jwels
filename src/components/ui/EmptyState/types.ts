import type { ReactNode } from "react";
import type { EmptyStateIconName, EmptyStatePresetName } from "constants/emptyStates";

export type EmptyStateProps = {
  /** Ready-made content from constants/emptyStates.ts. Any prop below overrides it. */
  preset?: EmptyStatePresetName;
  title?: ReactNode;
  description?: ReactNode;
  /** Name of a built-in icon, or pass `icon` for a custom one. */
  iconName?: EmptyStateIconName;
  icon?: ReactNode;
  /** Fully custom action (replaces the primary button). */
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
};

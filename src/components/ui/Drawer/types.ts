import type { ReactNode } from "react";

export type DrawerPlacement = "right" | "left" | "bottom";

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  placement?: DrawerPlacement;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  width?: string | number;
  className?: string;
};

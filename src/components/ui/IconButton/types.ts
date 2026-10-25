import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonShape = "round" | "square";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  isLoading?: boolean;
};

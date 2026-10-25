import type { InputHTMLAttributes, ReactNode } from "react";

export type RadioCardProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  rightSlot?: ReactNode;
};

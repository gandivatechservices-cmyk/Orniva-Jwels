import type { ReactNode } from "react";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
};

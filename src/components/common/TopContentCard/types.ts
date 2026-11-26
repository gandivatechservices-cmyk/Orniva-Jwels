import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TopContentCardProps {
  /** Optional eyebrow badge or category/label text */
  eyebrow?: ReactNode;
  /** Main heading title */
  title: ReactNode;
  /** Subtitle or description text */
  subtitle?: ReactNode;
  /** Background image URL */
  image?: string;
  /** Alt text for background image */
  imageAlt?: string;
  /** Optional breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional badge or chip */
  badge?: ReactNode;
  /** Optional actions */
  actions?: ReactNode;
  /** Aria label for the section */
  ariaLabel?: string;
  /** Custom class name */
  className?: string;
  /** Optional children rendered within content container */
  children?: ReactNode;
  /** Content alignment: 'center' (default) or 'left' */
  align?: "center" | "left";
  /**
   * Layout variant. "split" (default): content on the left, image on the right.
   * "overlay": dark banner with the image behind centered text.
   */
  variant?: "overlay" | "split";
  /** Height size variant */
  size?: "sm" | "md" | "lg";
}

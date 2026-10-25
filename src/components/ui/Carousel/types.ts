import type { ReactNode } from "react";

export type CarouselProps = {
  children: ReactNode[];
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  itemClassName?: string;
};

import type { ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
};

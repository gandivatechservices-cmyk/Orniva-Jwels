import type { ReactNode } from "react";
import { staticPageMetadata } from "lib/seo";

export const metadata = staticPageMetadata("ring-size-guide");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

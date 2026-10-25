import type { ReactNode } from "react";
import { staticPageMetadata } from "lib/seo";

export const metadata = staticPageMetadata("categories");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

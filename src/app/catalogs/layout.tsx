import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogs",
  description: "Browse every LUXE JWELS catalogue and shop the full range.",
  alternates: { canonical: "/catalogs" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Jewellery Design Studio | LUXE JWELS Bespoke Atelier",
  description:
    "Bring your dream jewellery piece to life. Choose your precious metal, certified diamond, sizing, and collaborate with our master artisans.",
};

export default function CustomJewelleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

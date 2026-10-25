import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { JsonLd } from "components/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, organizationJsonLd } from "lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Online Grocery Shopping in the UK`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    title: `${SITE_NAME} | Online Grocery Shopping in the UK`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Online Grocery Shopping in the UK`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <JsonLd data={organizationJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

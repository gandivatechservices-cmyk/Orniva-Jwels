import type { NextConfig } from "next";
import { NOINDEX_ROUTES } from "./src/lib/seo/routes";

const nextConfig: NextConfig = {
  devIndicators: false,
  productionBrowserSourceMaps: false,
  experimental: {
    // Server source maps made the build output exceed Amplify's 220 MB limit.
    serverSourceMaps: false,
    turbopackSourceMaps: false,
  },
  async headers() {
    return NOINDEX_ROUTES.flatMap((route) =>
      [`/${route}`, `/${route}/:path*`].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      }))
    );
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

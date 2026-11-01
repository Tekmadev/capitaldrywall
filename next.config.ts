import type { NextConfig } from "next";

const longCache = "public, max-age=2592000, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 75, 85],
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [
      {
        // Apex is canonical (brief §1): www → apex
        source: "/:path*",
        has: [{ type: "host", value: "www.capitaldrywallrenovations.com" }],
        destination: "https://capitaldrywallrenovations.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/sequences/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
      { source: "/video/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
    ];
  },
};

export default nextConfig;

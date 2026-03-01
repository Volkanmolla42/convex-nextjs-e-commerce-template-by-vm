import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
      {
        protocol: "https",
        hostname: "**.convex.site",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {
    resolveAlias: {
      ".prisma/client/default": "./node_modules/.prisma/client/default.js",
    },
  },
  images: {
    // WSL/DNS64 can resolve Discord CDN to NAT64 "private" IPv6; allowlisted hosts only.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "telegram.org",
      },
      {
        protocol: "https",
        hostname: "**.telegram-cdn.org",
      },
      {
        protocol: "https",
        hostname: "t.me",
      },
    ],
  },
};

export default nextConfig;

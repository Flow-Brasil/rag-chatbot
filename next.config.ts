import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    },
    typedRoutes: true,
    serverComponentsExternalPackages: ["pdf-parse", "sharp"],
  },
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
  },
  env: {
    ["NEXT_PUBLIC_RAGIE_API_KEY"]: process.env["NEXT_PUBLIC_RAGIE_API_KEY"],
  },
  // Otimizações de build
  poweredByHeader: false,
  compress: true,
  // Cache e otimização
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default withAxiom(config);

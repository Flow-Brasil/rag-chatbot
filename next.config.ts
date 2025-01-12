import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  env: {
    ["NEXT_PUBLIC_RAGIE_API_KEY"]: process.env["NEXT_PUBLIC_RAGIE_API_KEY"],
  },
};

export default config;

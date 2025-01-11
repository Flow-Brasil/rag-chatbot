/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Otimizações estáveis do Next.js 15
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Otimizações de imagem
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;

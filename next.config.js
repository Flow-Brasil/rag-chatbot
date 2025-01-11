/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Otimizações estáveis do Next.js 15
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Otimizações de cache
    typedRoutes: true,
    // Otimização de compilação
    turbo: {
      rules: {
        // Otimiza regras de build
        "**/*": {
          loaders: ["@next/font/google", "next-image-loader"],
        },
      },
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
  // Configuração de paths
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
      "@components": "./src/components",
      "@lib": "./src/lib",
      "@hooks": "./src/hooks",
      "@utils": "./src/utils",
    };
    return config;
  },
};

module.exports = nextConfig;

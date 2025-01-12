/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configurações de ambiente
  experimental: {
    // Otimizações de pacotes
    optimizePackageImports: ['@nextui-org/react', '@radix-ui/react-*'],
    // Melhor suporte a streaming
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  
  // Otimizações de logging
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
  
  // Otimizações de build
  compiler: {
    removeConsole: process.env['NODE_ENV'] === "production",
  },

  // Configurações de segurança
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;

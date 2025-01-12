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
  // Configuração de webpack
  webpack: (config, { isServer }) => {
    // Configuração existente de aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
      "@components": "./src/components",
      "@lib": "./src/lib",
      "@hooks": "./src/hooks",
      "@utils": "./src/utils",
    };

    // Configuração para fontes locais
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[hash].[ext]",
          outputPath: "static/fonts/",
          publicPath: "/_next/static/fonts/",
        },
      },
    });

    // Configuração para CSS
    if (!isServer) {
      config.plugins.push(
        new (require("mini-css-extract-plugin"))({
          filename: "static/css/[name].[contenthash].css",
          chunkFilename: "static/css/[id].[contenthash].css",
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;

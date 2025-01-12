import type { NextConfig } from 'next'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
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
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Configuração de webpack
  webpack: (config, { isServer }) => {
    // Configuração de aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": "./src",
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
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash].css",
          chunkFilename: "static/css/[id].[contenthash].css",
        })
      );
    }

    return config;
  },
};

export default nextConfig;

import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import { themeConfig } from "./src/lib/config/theme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      colors: themeConfig.light.colors,
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            table: {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '1rem 0',
            },
            'th,td': {
              border: '1px solid #e5e7eb',
              padding: '0.5rem 1rem',
              textAlign: 'left',
            },
            th: {
              backgroundColor: '#f9fafb',
              fontWeight: '600',
            },
            'tr:nth-child(even)': {
              backgroundColor: '#f9fafb',
            },
          },
        },
      },
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          colors: themeConfig.light.colors,
        },
        dark: {
          colors: themeConfig.dark.colors,
        },
      },
    }),
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
};

export default config;

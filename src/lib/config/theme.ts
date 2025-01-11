export const themeConfig = {
  light: {
    colors: {
      background: "#ffffff",
      foreground: "#11181c",
      primary: {
        DEFAULT: "#006FEE",
        foreground: "#ffffff",
      },
      secondary: {
        DEFAULT: "#7828c8",
        foreground: "#ffffff",
      },
      success: {
        DEFAULT: "#17c964",
        foreground: "#ffffff",
      },
      warning: {
        DEFAULT: "#f5a524",
        foreground: "#ffffff",
      },
      danger: {
        DEFAULT: "#f31260",
        foreground: "#ffffff",
      },
      // Radix UI specific colors
      border: "hsl(214.3 31.8% 91.4%)",
      input: "hsl(214.3 31.8% 91.4%)",
      ring: "hsl(222.2 84% 4.9%)",
      muted: {
        DEFAULT: "hsl(210 40% 96.1%)",
        foreground: "hsl(215.4 16.3% 46.9%)",
      },
      accent: {
        DEFAULT: "hsl(210 40% 96.1%)",
        foreground: "hsl(222.2 47.4% 11.2%)",
      },
      popover: {
        DEFAULT: "#ffffff",
        foreground: "#11181c",
      },
      card: {
        DEFAULT: "#ffffff",
        foreground: "#11181c",
      },
    },
  },
  dark: {
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      primary: {
        DEFAULT: "#006FEE",
        foreground: "#ffffff",
      },
      secondary: {
        DEFAULT: "#9353d3",
        foreground: "#ffffff",
      },
      success: {
        DEFAULT: "#17c964",
        foreground: "#ffffff",
      },
      warning: {
        DEFAULT: "#f5a524",
        foreground: "#ffffff",
      },
      danger: {
        DEFAULT: "#f31260",
        foreground: "#ffffff",
      },
      // Radix UI specific colors
      border: "hsl(216 34% 17%)",
      input: "hsl(216 34% 17%)",
      ring: "hsl(212.7 26.8% 83.9%)",
      muted: {
        DEFAULT: "hsl(223 47% 11%)",
        foreground: "hsl(215.4 16.3% 56.9%)",
      },
      accent: {
        DEFAULT: "hsl(216 34% 17%)",
        foreground: "hsl(210 40% 98%)",
      },
      popover: {
        DEFAULT: "#000000",
        foreground: "#ffffff",
      },
      card: {
        DEFAULT: "#000000",
        foreground: "#ffffff",
      },
    },
  },
} as const; 
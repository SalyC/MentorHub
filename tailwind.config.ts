import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Base neutrals — cool paper, warm ink (deliberately not the
        // common cream/terracotta AI-generated default).
        paper: "#F2F4F1",
        ink: {
          DEFAULT: "#1C2321",
          soft: "#3D4744",
          faint: "#6B7572",
        },
        line: "#DADFDA",
        // Brand accents
        ochre: {
          DEFAULT: "#B9791F",
          50: "#FBF3E7",
          100: "#F3E0BE",
          400: "#C98A2B",
          500: "#B9791F",
          600: "#96611A",
        },
        pine: {
          DEFAULT: "#2F6F62",
          50: "#EAF3F1",
          100: "#CFE5DF",
          400: "#3B8474",
          500: "#2F6F62",
          600: "#245A4F",
        },
        danger: {
          DEFAULT: "#B3432E",
          50: "#FBEAE6",
        },
        background: "#F2F4F1",
        foreground: "#1C2321",
        card: "#FFFFFF",
        border: "#DADFDA",
        primary: {
          DEFAULT: "#2F6F62",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#B9791F",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E7EAE6",
          foreground: "#6B7572",
        },
        destructive: {
          DEFAULT: "#B3432E",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  // plugins: [require("tailwindcss-animate")],
} satisfies Config;

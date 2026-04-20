import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "0",
      screens: { "2xl": "1600px" },
    },
    extend: {
      colors: {
        bg: "#0A0A0A",
        fg: "#F5F5F5",
        accent: "#00FF66",
        "accent-ink": "#0A0A0A",
        mute: {
          70: "rgba(245,245,245,0.70)",
          50: "rgba(245,245,245,0.50)",
          40: "rgba(245,245,245,0.40)",
          30: "rgba(245,245,245,0.30)",
          20: "rgba(245,245,245,0.20)",
          12: "rgba(245,245,245,0.12)",
          10: "rgba(245,245,245,0.10)",
          8: "rgba(245,245,245,0.08)",
          6: "rgba(245,245,245,0.06)",
          4: "rgba(245,245,245,0.04)",
          2: "rgba(245,245,245,0.02)",
        },
        up: "#00FF66",
        down: "#606060",
        flat: "rgba(245,245,245,0.5)",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.12em" }],
        mono: ["11px", { lineHeight: "16px", letterSpacing: "0.1em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        crisp: "-0.02em",
        caps: "0.12em",
      },
      borderColor: {
        DEFAULT: "rgba(245,245,245,0.08)",
      },
      borderRadius: {
        none: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
      },
      keyframes: {
        "void-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "cursor-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "void-pulse": "void-pulse 2s infinite",
        "cursor-blink": "cursor-blink 1s infinite",
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

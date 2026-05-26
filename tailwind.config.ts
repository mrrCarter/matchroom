import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#060816",
        surface: "#0D1324",
        "surface-2": "#121A31",
        border: "rgba(255,255,255,0.08)",
        text: "#F5F7FB",
        muted: "#A9B2C7",
        green: "#5BF2A5",
        blue: "#66B3FF",
        gold: "#FFC857",
        danger: "#FF6B6B",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(91,242,165,0.35)",
        "glow-blue": "0 0 40px -8px rgba(102,179,255,0.35)",
      },
      keyframes: {
        "pulse-cta": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(91,242,165,0.45)" },
          "50%": { boxShadow: "0 0 0 12px rgba(91,242,165,0)" },
        },
      },
      animation: {
        "pulse-cta": "pulse-cta 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

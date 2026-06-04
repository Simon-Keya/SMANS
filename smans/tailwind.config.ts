import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  darkMode: ["class"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },

      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },

  plugins: [animate, daisyui],

  daisyui: {
    themes: [
      {
        smans: {
          primary: "#1E40AF",
          secondary: "#0D9488",
          accent: "#EA580C",
          neutral: "#1F2937",

          "base-100": "#F8FAFC",
          "base-200": "#E2E8F0",
          "base-300": "#CBD5E1",
          "base-content": "#0F172A",

          info: "#0EA5E9",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1rem",

          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",

          "--btn-focus-scale": "0.98",

          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.75rem",
        },
      },

      "light",
      "dark",
    ],

    defaultTheme: "smans",

    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: "",
  },
};

export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        smans: {
          primary: "#1e40af",
          primaryHover: "#1e3a8a",
          secondary: "#0d9488",
          secondaryHover: "#0f766e",
          accent: "#ea580c",
          accentHover: "#c2410c",
          neutral: "#1f2937",
          base: "#f8fafc",
          muted: "#64748b",
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        smans: {
          primary: "#1e40af",
          "primary-focus": "#1e3a8a",
          "primary-content": "#ffffff",

          secondary: "#0d9488",
          "secondary-focus": "#0f766e",
          "secondary-content": "#ffffff",

          accent: "#ea580c",
          "accent-focus": "#c2410c",
          "accent-content": "#ffffff",

          neutral: "#1f2937",
          "neutral-focus": "#111827",
          "neutral-content": "#f1f5f9",

          "base-100": "#f8fafc",
          "base-200": "#e2e8f0",
          "base-300": "#cbd5e1",
          "base-content": "#0f172a",

          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",

          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.25rem",

          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
        },
      },
      "light",
      "dark",
    ],
    defaultTheme: "smans",          // This activates your custom theme
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
};
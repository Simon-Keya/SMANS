/** @type {import('tailwindcss').Config} */

const daisyui = require("daisyui")

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    daisyui
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

          neutral: "#1f2937",

          "base-100": "#f8fafc",
          "base-200": "#e2e8f0",
          "base-300": "#cbd5e1",
          "base-content": "#0f172a",

          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "light",
      "dark",
    ],

    defaultTheme: "smans",
  },
}
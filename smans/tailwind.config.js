/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx,mdx}", // ✅ extra safety for scanning issues
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
    require("tailwindcss-animate"), // animations
    require("daisyui"), // ✅ direct require (more stable for v5)
  ],

  daisyui: {
    // ✅ safer ordering for v5
    themes: [
      "light",
      "dark",
      {
        smans: {
          primary: "#1e40af",
          secondary: "#0d9488",
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
    ],

    defaultTheme: "smans",
    darkTheme: "dark",
  },
};
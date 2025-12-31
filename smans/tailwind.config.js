/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "corporate",
      "emerald",
      {
        smans: {
          // Primary: Deep, trustworthy blue (inspired by university blues)
          primary: "#1e40af",        // Blue-800 - strong, professional
          "primary-focus": "#1e3a8a", // Blue-900
          "primary-content": "#ffffff",

          // Secondary: Calm, supportive teal/green (growth, learning)
          secondary: "#0d9488",       // Teal-600
          "secondary-focus": "#0f766e", // Teal-700
          "secondary-content": "#ffffff",

          // Accent: Warm, energetic orange (call-to-action, motivation)
          accent: "#ea580c",          // Orange-600
          "accent-focus": "#c2410c",  // Orange-700
          "accent-content": "#ffffff",

          // Neutral: Clean, readable grays
          neutral: "#374151",         // Gray-700
          "neutral-focus": "#1f2937", // Gray-800
          "neutral-content": "#ffffff",

          // Base colors: Clean white/light background
          "base-100": "#f8fafc",      // Slate-50 (very light gray for calm feel)
          "base-200": "#e2e8f0",      // Slate-200
          "base-300": "#cbd5e1",      // Slate-300
          "base-content": "#1e293b",  // Slate-800 (dark text)

          // State colors
          info: "#0ea5e9",            // Sky-500
          success: "#22c55e",         // Green-500
          warning: "#f59e0b",         // Amber-500
          error: "#ef4444",           // Red-500

          // Rounded corners for modern, friendly feel
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.5rem",

          // Subtle animations
          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",
        },
      },
    ],
    darkTheme: "dark",  // Use built-in dark as fallback, or create custom later
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
};
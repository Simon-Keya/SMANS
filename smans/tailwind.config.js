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
      colors: {
        // Optional: define custom colors you can use directly in classes
        smans: {
          primary: "#1e40af",        // Deep blue – trust & professionalism
          primaryHover: "#1e3a8a",   // Darker hover
          secondary: "#0d9488",      // Teal – growth, learning, calm
          secondaryHover: "#0f766e",
          accent: "#ea580c",         // Warm orange – energy, call-to-action
          accentHover: "#c2410c",
          neutral: "#1f2937",        // Dark gray for text/background contrast
          base: "#f8fafc",           // Very light background
          muted: "#64748b",          // Subtle gray for secondary text
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
      "light",
      "dark",
      {
        smans: {
          // Primary – main buttons, links, headers
          primary: "#1e40af",          // Deep professional blue
          "primary-focus": "#1e3a8a",
          "primary-content": "#ffffff",

          // Secondary – subtle highlights, success states
          secondary: "#0d9488",        // Teal – education/growth
          "secondary-focus": "#0f766e",
          "secondary-content": "#ffffff",

          // Accent – urgent actions, warnings, highlights
          accent: "#ea580c",           // Warm orange – attention & motivation
          "accent-focus": "#c2410c",
          "accent-content": "#ffffff",

          // Neutral – backgrounds, borders, text
          neutral: "#1f2937",          // Slate-800 – dark text/background
          "neutral-focus": "#111827",  // Slate-900
          "neutral-content": "#f1f5f9", // Very light gray for text on dark

          // Base colors – main background & content
          "base-100": "#f8fafc",       // Slate-50 – clean light background
          "base-200": "#e2e8f0",       // Slate-200
          "base-300": "#cbd5e1",       // Slate-300
          "base-content": "#0f172a",   // Slate-900 – dark text

          // Feedback colors
          info: "#0ea5e9",             // Sky-500 – information
          success: "#22c55e",          // Green-500 – success
          warning: "#f59e0b",          // Amber-500 – warnings
          error: "#ef4444",            // Red-500 – errors

          // Rounded corners – modern & friendly
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.25rem",

          // Smooth animations
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
        },
      },
    ],
    darkTheme: "dark", // fallback to built-in dark theme
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  },
};
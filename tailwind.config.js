/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        display: ["Cairo", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#fffdf0",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#f5c518",
          500: "#c9970c",
          600: "#a07808",
          700: "#7a5a05",
          800: "#5c4204",
          900: "#3d2d02",
        },
        gold: {
          50: "#fffdf0",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#f5c518",
          500: "#c9970c",
          600: "#a07808",
          700: "#7a5a05",
        },
        obsidian: {
          950: "#020202",
          900: "#080808",
          800: "#0f0f0f",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2e2e2e",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        foreground: "#F8FAFC",
        brand: {
          slateDeep: "#070B14",
          slateCard: "#0F172A",
          orange: "#F07C27",
          orangeLight: "#FFA048",
          orangeDark: "#D86312",
          navy: "#2D325E",
          navyLight: "#41477F",
          navyDark: "#181D3D",
          surface: "#111A33",
          surfaceCard: "#152244",
          surfaceHover: "#1B2A54",
          gold: "#FFB703",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        handwritten: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        "orange-glow": "0 0 30px -5px rgba(240, 124, 39, 0.45)",
        "navy-glow": "0 0 30px -5px rgba(45, 50, 94, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 5s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2.5s infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

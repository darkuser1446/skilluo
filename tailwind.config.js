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
        foreground: "#111111",
        ink: "#111111",
        surface: {
          DEFAULT: "#F9F9F9",
          lowest: "#FFFFFF",
          low: "#F4F3F3",
          container: "#EEEEEE",
          high: "#E8E8E8",
          highest: "#E2E2E2",
          dim: "#DADADA",
        },
        parchment: {
          DEFAULT: "#FFF0E5",
          light: "#FFF8F2",
          dark: "#FFE2CC",
        },
        primary: {
          DEFAULT: "#F07C27",
          container: "#F07C27",
          hover: "#FF8A3D",
          dark: "#994700",
        },
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
        "neo-xs": "2px 2px 0px #111111",
        "neo-sm": "3px 3px 0px #111111",
        "neo": "4px 4px 0px #111111",
        "neo-md": "6px 6px 0px #111111",
        "neo-lg": "8px 8px 0px #111111",
        "neo-xl": "10px 10px 0px #111111",
        "neo-orange": "4px 4px 0px #F07C27",
        "neo-orange-lg": "8px 8px 0px #F07C27",
        "neo-white": "4px 4px 0px #FFFFFF",
        "orange-glow": "0 0 30px -5px rgba(240, 124, 39, 0.45)",
        "navy-glow": "0 0 30px -5px rgba(45, 50, 94, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 5s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2.5s infinite",
        "marquee": "marquee 24s linear infinite",
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

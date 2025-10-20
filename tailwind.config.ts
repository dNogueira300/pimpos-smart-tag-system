import type { Config } from "tailwindcss";
// Importa el plugin para añadir utilidades personalizadas
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ... (Todos tus colores se quedan igual)
        primary: { orange: "#FF8C42", brown: "#8B5A3C" },
        budget: {
          success: "#27AE60",
          warning: "#F39C12",
          alert: "#E67E22",
          critical: "#E74C3C",
        },
        nutrition: { octagon: "#000000", contrast: "#FFFFFF" },
        neutral: {
          "dark-text": "#2C3E50",
          "medium-text": "#7F8C8D",
          "light-border": "#ECF0F1",
          "cream-bg": "#FFFEF7",
        },
        admin: {
          sidebar: "#2C3E50",
          "sidebar-text": "#FFFFFF",
          "main-bg": "#F8F9FA",
          "btn-primary": "#FF8C42",
          "btn-secondary": "#7F8C8D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      // Clases 'animate-...' personalizadas
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        // NUEVAS (de tu CSS)
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
      },
      // Keyframes para las animaciones
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // NUEVOS (de tu CSS)
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    // Plugin para añadir la utilidad del octágono
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".clip-octagon": {
          "clip-path":
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
        },
      });
    }),
  ],
};

export default config;

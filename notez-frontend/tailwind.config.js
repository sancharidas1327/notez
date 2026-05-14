/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        surface: {
          DEFAULT: "#07080f",
          card: "#101522",
          hover: "#182033",
          border: "#273244",
        },
        accent: {
          cyan: "#67e8f9",
          pink: "#fb7185",
          gold: "#fbbf24",
          violet: "#a78bfa",
          mint: "#5eead4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse at top, #7c3aed22 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
        "xp-pop": "xpPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "slow-drift": "slowDrift 14s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: "translateY(16px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
        pulseGlow: { "0%,100%": { boxShadow: "0 0 8px #67e8f966" }, "50%": { boxShadow: "0 0 24px #a78bfaaa" } },
        xpPop: { from: { transform: "scale(0.5)", opacity: 0 }, to: { transform: "scale(1)", opacity: 1 } },
        slowDrift: { from: { transform: "translateY(0)" }, to: { transform: "translateY(-18px)" } },
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#1A1F2C",
        primary: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        destructive: {
          DEFAULT: "#ea384c",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#FFFFFF",
          foreground: "#403E43",
        },
        accent: {
          DEFAULT: "#FF4D00",  // Changed to orange-red for flame
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        flame: {
          inner: "#FFD700",    // Yellow core
          middle: "#FF4D00",   // Orange-red middle
          outer: "#FF8C00",    // Dark orange outer
        }
      },
      borderRadius: {
        lg: "0.8rem",
        md: "0.6rem",
        sm: "0.4rem",
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "flame-pulse": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 15px #FFD700, 0 0 30px #FF4D00, 0 0 45px #FF8C00",
          },
          "33%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 20px #FFD700, 0 0 40px #FF4D00, 0 0 60px #FF8C00",
          },
          "66%": {
            transform: "scale(0.98)",
            boxShadow: "0 0 25px #FFD700, 0 0 50px #FF4D00, 0 0 75px #FF8C00",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 15px #FFD700, 0 0 30px #FF4D00, 0 0 45px #FF8C00",
          }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-up": "scale-up 0.3s ease-out",
        "flame": "flame-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
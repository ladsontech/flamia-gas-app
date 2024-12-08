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
          DEFAULT: "#FF4D00",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        flame: {
          inner: "#007FFF",    // Bright blue core
          middle: "#FFA500",   // Orange middle
          outer: "#FFD700",    // Yellow outer
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
          "0%, 100%": {
            transform: "scale(1)",
            background: "radial-gradient(circle at center, #007FFF 0%, #FFA500 60%, #FFD700 100%)",
            boxShadow: "0 0 20px #007FFF, 0 0 40px #FFA500, 0 0 60px #FFD700",
            filter: "blur(1px)",
          },
          "50%": {
            transform: "scale(1.1)",
            background: "radial-gradient(circle at center, #007FFF 0%, #FFA500 70%, #FFD700 100%)",
            boxShadow: "0 0 30px #007FFF, 0 0 60px #FFA500, 0 0 90px #FFD700",
            filter: "blur(2px)",
          }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-up": "scale-up 0.3s ease-out",
        "flame": "flame-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
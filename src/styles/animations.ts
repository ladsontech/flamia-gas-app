
export const keyframes = {
  "fade-up": {
    "0%": {
      opacity: "0",
      transform: "translateY(5px)",
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
    "0%": { transform: "scale(0.98)" },
    "100%": { transform: "scale(1)" },
  },
  "flame-pulse": {
    "0%": {
      transform: "scale(1)",
      boxShadow: "0 0 15px #007FFF, 0 0 30px #FF6B00, 0 0 45px #4169E1",
    },
    "33%": {
      transform: "scale(1.02)",
      boxShadow: "0 0 20px #007FFF, 0 0 40px #FF6B00, 0 0 60px #4169E1",
    },
    "66%": {
      transform: "scale(0.99)",
      boxShadow: "0 0 25px #007FFF, 0 0 50px #FF6B00, 0 0 75px #4169E1",
    },
    "100%": {
      transform: "scale(1)",
      boxShadow: "0 0 15px #007FFF, 0 0 30px #FF6B00, 0 0 45px #4169E1",
    }
  }
};

export const animations = {
  "fade-up": "fade-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "fade-in": "fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "scale-up": "scale-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "flame": "flame-pulse 1.5s ease-in-out infinite",
};

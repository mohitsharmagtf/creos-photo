import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        creo: {
          blue: "#0757C2",
          navy: "#0A2458",
          red: "#D71920",
          sky: "#EAF4FF"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(10, 36, 88, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

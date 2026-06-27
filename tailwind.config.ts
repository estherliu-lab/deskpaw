import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff8ef",
        paper: "#fffdf8",
        ink: "#283034",
        honey: "#d9a76c",
        coral: "#e97863",
        moss: "#6a8f72",
        teal: "#497f83",
        berry: "#9b4d68"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(95, 70, 45, 0.14)",
        lift: "0 12px 28px rgba(56, 71, 67, 0.13)"
      }
    }
  },
  plugins: []
} satisfies Config;

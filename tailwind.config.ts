import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Arial", "sans-serif"] },
      colors: {
        echo: {
          red: "#D60000",
          emergency: "#FF3830",
          green: "#34C759",
          yellow: "#FFCC00",
          blue: "#007AFF",
          ink: "#101010",
          muted: "#687280",
          canvas: "#FAFAFA",
          border: "#E5E7EB",
        },
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.06)",
        lift: "0 10px 28px rgba(16,16,16,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;

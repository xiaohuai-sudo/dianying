import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0F12",
        panel: "#171A1F",
        paper: "#F1ECE2",
        muted: "#A9A7A2",
        ember: "#B64A3A",
        gold: "#C69A5B",
        line: "#2A2D32",
      },
      fontFamily: {
        sans: ["Inter", "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", "sans-serif"],
        serif: ["Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", "SimSun", "serif"],
      },
      letterSpacing: { widecn: "0.16em" },
    },
  },
  plugins: [],
} satisfies Config;

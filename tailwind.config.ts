import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F6F2EB",
        foreground: "#151413",
        surface: {
          light: "#FDFBF7",
          warm: "#EFE8DC",
          card: "#F2EBE0",
          guide: "#ECE4D6",
          dark: "#141312",
        },
        editorial: {
          dark: "#151413",
          muted: "#666159",
          caption: "#807B72",
          accent: "#A16A44",
          border: "#DED6CA",
          line: "#D2C8BA",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        nav: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.22em",
        wideLabel: "0.18em",
        tighterNav: "0.15em",
        widestLabel: "0.28em",
      },
    },
  },
  plugins: [],
};

export default config;

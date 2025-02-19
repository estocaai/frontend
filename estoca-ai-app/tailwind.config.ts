import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cinza1: "#4E4E4E",
        cinza2: "#6E6E6E",
        cinza3: "#8E8E8E",
        cinza4: "#AEAEAE",
        azul1: "#6CB0BE",
        azul2: "#8CC8D5",
        azul3: "#A3D9E4"
      },
      /* PARA tamanho de fontes usar text-2xl text-xl text-lg text-base text-sm*/
    },
  },
  plugins: [],
} satisfies Config;

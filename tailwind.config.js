/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.json"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), daisyui],
  daisyui: {
    themes: ["bumblebee"],
  },
};

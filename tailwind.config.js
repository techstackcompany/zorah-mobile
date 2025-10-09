import COLORS from "./constants/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: COLORS,
      fontFamily: {
        degular: ["DegularRegular"],
        degularMedium: ["DegularMedium"],
        degularSemibold: ["DegularSemibold"],
        degularBold: ["DegularBold"],
        nunito: ["NunitoRegular"],
        nunitoMedium: ["NunitoMedium"],
        nunitoSemibold: ["NunitoSemibold"],
        nunitoBold: ["NunitoBold"],
      },
    },
  },
  plugins: [],
};

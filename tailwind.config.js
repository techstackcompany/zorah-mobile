import COLORS from "./constants/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: COLORS,
      fontFamily: {
        // Degular family
        degular: ["DegularRegular"],
        degularMedium: ["DegularMedium"],
        degularMediumItalic: ["DegularMediumItalic"],
        degularSemibold: ["DegularSemibold"],
        degularSemiboldItalic: ["DegularSemiboldItalic"],
        degularBold: ["DegularBold"],
        degularBoldItalic: ["DegularBoldItalic"],

        // Nunito Sans family
        nunito: ["NunitoRegular"],
        nunitoMedium: ["NunitoMedium"],
        nunitoMediumItalic: ["NunitoMediumItalic"],
        nunitoSemibold: ["NunitoSemibold"],
        nunitoSemiboldItalic: ["NunitoSemiboldItalic"],
        nunitoBold: ["NunitoBold"],
        nunitoBoldItalic: ["NunitoBoldItalic"],

        // Poppins family
        poppinsLight: ["PoppinsLight"],
        poppinsLightItalic: ["PoppinsLightItalic"],
        poppins: ["PoppinsRegular"],
        poppinsMedium: ["PoppinsMedium"],
        poppinsMediumItalic: ["PoppinsMediumItalic"],
        poppinsSemibold: ["PoppinsSemibold"],
        poppinsSemiboldItalic: ["PoppinsSemiboldItalic"],
        poppinsBold: ["PoppinsBold"],
        poppinsBoldItalic: ["PoppinsBoldItalic"],
        poppinsExtrabold: ["PoppinsExtrabold"],
        poppinsExtraboldItalic: ["PoppinsExtraboldItalic"],
        poppinsBlack: ["PoppinsBlack"],
        poppinsBlackItalic: ["PoppinsBlackItalic"],
      },
    },
  },
  plugins: [],
};

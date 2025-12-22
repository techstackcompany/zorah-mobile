import { ImageStyle } from "expo-image";
import COLORS from "./colors";

type Slide = {
  id: number;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  image: any;
  imagePosition?: string;
  bgColor?: string;
  imageStyle?: ImageStyle;
};


export const slides: Slide[] = [
  {
    id: 1,
    title: "Money management made",
    highlight: "simple",
    subtitle: "Money Management",
    bgColor: COLORS.primary_100,
    description:
      "Zorah helps you track budgets, set savings goals, and stay in control of your money.",
    image: require("../assets/images/onboarding/image1.png"),
  },
  {
    id: 2,
    title: "Shop smarter, save",
    highlight: "bigger",
    subtitle: "MarketPlace",
    bgColor: COLORS.secondary_100,
    description:
      "Shop local, save more. Zorah MarketPlace brings you the best deals while supporting local vendors.",
    image: require("../assets/images/onboarding/image2.png"),
  },
  {
    id: 3,
    title: "Shop smarter, save",
    highlight: "bigger",
    subtitle: "MarketPlace",
    bgColor: COLORS.primary_100,
    imagePosition: "right bottom",
    description:
      "Shop local, save more. Zorah MarketPlace brings you the best deals while supporting local vendors.",
    image: require("../assets/images/onboarding/image3.png"),
  },
  {
    id: 4,
    title: "Budget smart for every",
    highlight: "celebration",
    subtitle: "MarketPlace",
    imageStyle: { transform: "translateX(10%)" },
    description:
      "From aso ebi to transport and gifts, keep your event expenses simple, organized and debt-free.",
    image: require("../assets/images/onboarding/image4.png"),
  },
];
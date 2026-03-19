import { ImageStyle } from "expo-image";

type Slide = {
  id: number;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  image: any;
  imagePosition?: string;
  imageStyle?: ImageStyle;
};

export const slides: Slide[] = [
  {
    id: 1,
    title: "Money management made",
    highlight: "simple",
    subtitle: "Money Management",
    description:
      "Zorah helps you track budgets, set savings goals, and stay in control of your money.",
    image: require("../assets/images/onboarding/image1.png"),
  },
  {
    id: 2,
    title: "Account",
    highlight: "Integration",
    subtitle: "MarketPlace",
    description:
      "Accounts Integration securely connects all your bank accounts in one place giving you a complete, real-time view of your finances.",
    image: require("../assets/images/onboarding/image2.png"),
  },

  {
    id: 3,
    title: "Expense",
    highlight: "tracking",
    subtitle: "",
    description:
      "Zorah helps you track every transaction effortlessly. Stay aware, stay ahead and take control or your financial journey today.",
    image: require("../assets/images/onboarding/image3.png"),
  },
  {
    id: 4,
    title: "Budget smart for every",
    highlight: "event or project",
    subtitle: "MarketPlace",
    description:
      "From aso-ebi to vendors and gifts, keep your event or project expenses simple, organized and debt-free.",
    image: require("../assets/images/onboarding/image4.png"),
  },
];

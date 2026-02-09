import COLORS from "@/constants/colors";
import type { ImageSource } from "expo-image";

export type FxPair = {
  id: string;
  base: string;
  quote: string;
  label: string;
  value: number;
  change: number;
  countryFlag?: string;
};

export type FxSeriesPoint = { label: string; value: number };

export const fxPairsToFetch = [
  { base: "USD", quote: "NGN" },
  { base: "GBP", quote: "NGN" },
  { base: "EUR", quote: "NGN" },
  { base: "CAD", quote: "NGN" },
];
export const CURRENCY_FLAGS: Record<string, ImageSource> = {
  NGN: require("@/assets/icons/nigeria-flag-curved.svg"),
  USD: require("@/assets/icons/united-states-flag-curved.svg"),
  GBP: require("@/assets/icons/united-kingdom-flag-curved.svg"),
  EUR: require("@/assets/icons/european-union-flag-curved.svg"),
  CAD: require("@/assets/icons/canada-flag-curved.svg"),
  JPY: require("@/assets/icons/japan-flag-curved.svg"),
  AUD: require("@/assets/icons/australia-flag-curved.svg"),
};


export const FX_PAIRS: FxPair[] = [
  {
    id: "USDNGN",
    base: "USD",
    quote: "NGN",
    label: "USD/NGN",
    value: 0,
    change: 0,
  },
  {
    id: "GBPNGN",
    base: "GBP",
    quote: "NGN",
    label: "GBP/NGN",
    value: 0,
    change: 0,
  },
  {
    id: "EURNGN",
    base: "EUR",
    quote: "NGN",
    label: "EUR/NGN",
    value: 0,
    change: 0,
  },
  {
    id: "CADNGN",
    base: "CAD",
    quote: "NGN",
    label: "CAD/NGN",
    value: 0,
    change: 0,
  },
];

export type FxConverterOption = {
  code: string;
  name: string;
  flag: ImageSource;
};

export const FX_CONVERTER_OPTIONS: FxConverterOption[] = [
  { code: "NGN", name: "Nigerian Naira", flag: CURRENCY_FLAGS.NGN },
  { code: "USD", name: "US Dollar", flag: CURRENCY_FLAGS.USD },
  { code: "GBP", name: "British Pound", flag: CURRENCY_FLAGS.GBP },
  { code: "EUR", name: "Euro", flag: CURRENCY_FLAGS.EUR },
  { code: "CAD", name: "Canadian Dollar", flag: CURRENCY_FLAGS.CAD },
];

export const formatCurrency = (value: number, currency = "NGN") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    currencyDisplay: "narrowSymbol",
  })
    .format(value)
    .replace("NGN", "₦");

export const getChangeColor = (change: number) =>
  change >= 0 ? COLORS.secondary_500 : "#D83A56";

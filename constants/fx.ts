import COLORS from "@/constants/colors";

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

export const FX_TRENDS: Record<string, FxSeriesPoint[]> = {
  USDNGN: [
    { label: "Mon", value: 1410 },
    { label: "Tue", value: 1445 },
    { label: "Wed", value: 1432 },
    { label: "Thu", value: 1460 },
    { label: "Fri", value: 1422 },
    { label: "Sat", value: 1456 },
    { label: "Sun", value: 1440 },
  ],
  GBPNGN: [
    { label: "Mon", value: 1800 },
    { label: "Tue", value: 1785 },
    { label: "Wed", value: 1812 },
    { label: "Thu", value: 1850 },
    { label: "Fri", value: 1822 },
    { label: "Sat", value: 1838 },
    { label: "Sun", value: 1846 },
  ],
  EURNGN: [
    { label: "Mon", value: 1570 },
    { label: "Tue", value: 1598 },
    { label: "Wed", value: 1584 },
    { label: "Thu", value: 1610 },
    { label: "Fri", value: 1602 },
    { label: "Sat", value: 1618 },
    { label: "Sun", value: 1624 },
  ],
};

export const FX_PAIRS: FxPair[] = [
  { id: "CADNGN", base: "CAD", quote: "NGN", label: "CAD/NGN", value: 1650.1, change: 2.56 },
  { id: "USDCAD", base: "USD", quote: "CAD", label: "USD/CAD", value: 1.38314, change: -0.12 },
  { id: "GBPJPY", base: "GBP", quote: "JPY", label: "GBP/JPY", value: 243.43, change: 1.25 },
  { id: "EURCAD", base: "EUR", quote: "CAD", label: "EUR/CAD", value: 1.3834, change: -0.38 },
  { id: "USDAUD", base: "USD", quote: "AUD", label: "USD/AUD", value: 1.38314, change: -0.21 },
];

export const FX_CONVERTER_OPTIONS = [
  { code: "NGN", name: "Nigerian Naira" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "CAD", name: "Canadian Dollar" },
] as const;

export const formatCurrency = (value: number, currency = "NGN") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

export const getChangeColor = (change: number) =>
  change >= 0 ? COLORS.secondary_500 : "#D83A56";


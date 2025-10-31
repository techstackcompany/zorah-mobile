import COLORS from "@/constants/colors";

export type InvestmentCategory = {
  id: string;
  label: string;
  total: number;
  percentage: number;
  color: string;
  icon: keyof typeof ICON_MAP;
};

export type InvestmentHolding = {
  id: string;
  name: string;
  symbol: string;
  quantityLabel: string;
  amount: number;
  change: number;
  status: "active" | "inactive";
  categoryId: InvestmentCategory["id"];
  provider: string;
  purchaseDate: string;
  notes: string;
};

export type InvestmentTypeOption = {
  id: string;
  label: string;
};

export type InvestmentProviderGroup = {
  id: string;
  label: string;
  options: InvestmentTypeOption[];
};

const ICON_MAP = {
  crypto: "logo-bitcoin",
  bonds: "business-outline",
  realEstate: "home-outline",
  agriculture: "leaf-outline",
  treasury: "reader-outline",
  stocks: "stats-chart-outline",
};

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  {
    id: "crypto",
    label: "Crypto Currency",
    total: 1400000,
    percentage: 34.4,
    color: "#F9A02C",
    icon: "crypto",
  },
  {
    id: "bonds",
    label: "Bonds",
    total: 832000,
    percentage: 26,
    color: "#2FA89A",
    icon: "bonds",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    total: 830000,
    percentage: 18.9,
    color: "#6C5DD3",
    icon: "realEstate",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    total: 620000,
    percentage: 10.7,
    color: "#F2994A",
    icon: "agriculture",
  },
  {
    id: "treasury",
    label: "Treasury Bill",
    total: 480000,
    percentage: 5,
    color: "#56CCF2",
    icon: "treasury",
  },
  {
    id: "stocks",
    label: "Stocks (NSE)",
    total: 310000,
    percentage: 4.6,
    color: "#219653",
    icon: "stocks",
  },
];

export const INVESTMENT_HOLDINGS: InvestmentHolding[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    quantityLabel: "0.05 BTC • crypto",
    amount: 300000,
    change: 5.2,
    status: "active",
    categoryId: "crypto",
    provider: "Crypto.com",
    purchaseDate: "2025-05-15",
    notes: "Future investment.",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    quantityLabel: "2.1 ETH • crypto",
    amount: 700000,
    change: 4.8,
    status: "active",
    categoryId: "crypto",
    provider: "Binance",
    purchaseDate: "2025-03-18",
    notes: "Long term growth exposure.",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    quantityLabel: "8 SOL • crypto",
    amount: 250000,
    change: 5.2,
    status: "active",
    categoryId: "crypto",
    provider: "Coinbase",
    purchaseDate: "2025-04-03",
    notes: "Diversification play.",
  },
  {
    id: "fg-bond",
    name: "FG Bond",
    symbol: "FG",
    quantityLabel: "FG Bond • bonds",
    amount: 300000,
    change: 3.1,
    status: "active",
    categoryId: "bonds",
    provider: "Debt Management Office",
    purchaseDate: "2025-02-11",
    notes: "Federal government bond.",
  },
  {
    id: "ogun-bond",
    name: "Ogun State Bond",
    symbol: "OG",
    quantityLabel: "Ogun State Bond • bonds",
    amount: 700000,
    change: 2.6,
    status: "active",
    categoryId: "bonds",
    provider: "Stanbic IBTC",
    purchaseDate: "2025-01-24",
    notes: "State backed security.",
  },
  {
    id: "mutual-bond",
    name: "Mutual Bond",
    symbol: "MB",
    quantityLabel: "Mutual Bond • bonds",
    amount: 250000,
    change: 2.4,
    status: "active",
    categoryId: "bonds",
    provider: "ARM Investment",
    purchaseDate: "2024-12-20",
    notes: "Mutual bond contribution.",
  },
  {
    id: "cowry-savings",
    name: "Cowrywise Savings",
    symbol: "CW",
    quantityLabel: "Cowrywise • treasury",
    amount: 480000,
    change: 4.1,
    status: "active",
    categoryId: "treasury",
    provider: "Cowrywise",
    purchaseDate: "2025-02-28",
    notes: "Medium term savings.",
  },
  {
    id: "lagos-estate",
    name: "Lagos Island Condo",
    symbol: "LI",
    quantityLabel: "Rental income • real estate",
    amount: 830000,
    change: 3.8,
    status: "active",
    categoryId: "real-estate",
    provider: "Risevest",
    purchaseDate: "2024-10-02",
    notes: "Rental property investment.",
  },
  {
    id: "farm-corn",
    name: "Corn Harvest Co-op",
    symbol: "AG",
    quantityLabel: "Agric fund • agriculture",
    amount: 620000,
    change: 4.5,
    status: "active",
    categoryId: "agriculture",
    provider: "FarmCrowdy",
    purchaseDate: "2025-04-09",
    notes: "Seasonal harvest cycle.",
  },
  {
    id: "nse-brew",
    name: "NSE Breweries",
    symbol: "NB",
    quantityLabel: "120 units • stocks",
    amount: 310000,
    change: 3.4,
    status: "active",
    categoryId: "stocks",
    provider: "Meristem Securities",
    purchaseDate: "2025-03-01",
    notes: "Dividend focused stock.",
  },
];

export const INVESTMENT_TYPES: InvestmentTypeOption[] = [
  { id: "mutual-fund", label: "Mutual Fund" },
  { id: "stock", label: "Stock" },
  { id: "crypto", label: "Crypto" },
  { id: "fixed-savings", label: "Fixed Savings" },
  { id: "treasury-bill", label: "Treasury Bill" },
];

export const PROVIDER_GROUPS: InvestmentProviderGroup[] = [
  {
    id: "popular",
    label: "Popular Platforms",
    options: [
      { id: "cowrywise", label: "Cowrywise" },
      { id: "piggyvest", label: "PiggyVest" },
      { id: "risevest", label: "Risevest" },
    ],
  },
  {
    id: "banks",
    label: "Banks",
    options: [
      { id: "gtb", label: "GTBank" },
      { id: "zenith", label: "Zenith Bank" },
      { id: "uba", label: "UBA" },
      { id: "first-bank", label: "First Bank" },
      { id: "stanbic", label: "Stanbic IBTC" },
    ],
  },
  {
    id: "investment-firms",
    label: "Investment Firms",
    options: [
      { id: "arm", label: "ARM Investment" },
      { id: "meristem", label: "Meristem Securities" },
      { id: "kobo", label: "Kobo" },
      { id: "fgn", label: "FGN Bonds" },
    ],
  },
  {
    id: "others",
    label: "Others",
    options: [
      { id: "other", label: "Others" },
    ],
  },
];

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.abs(value));

export const formatPercentage = (value: number) =>
  `${value.toFixed(1)}%`;

export const getIconName = (key: keyof typeof ICON_MAP) => ICON_MAP[key];

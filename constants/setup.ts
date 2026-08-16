export type SetupRoute =
  | "/(app)/setup/financial-goals"
  | "/(app)/setup/monthly-income"
  | "/(app)/setup/kyc"
  | "/(app)/setup/your-banks";

export const setupInfo: Record<number, { route: SetupRoute; key: string }> = {
  1: {
    route: "/(app)/setup/financial-goals",
    key: "goals",
  },
  2: {
    route: "/(app)/setup/monthly-income",
    key: "income",
  },
  3: {
    route: "/(app)/setup/kyc",
    key: "kyc",
  },
  4: {
    route: "/(app)/setup/your-banks",
    key: "integration",
  },
};

export const SETUP_TOTAL_STEPS = 4;

export type SetupStep = { route: SetupRoute; key: string };

// `setupInfo` is typed as Record<number, …>, which tells TypeScript that every
// numeric key is populated — it is not. These lookups return null past either
// end so callers are forced to handle the boundary instead of reading `.route`
// off undefined at runtime.
export const getNextSetupStep = (step: number): SetupStep | null =>
  setupInfo[step + 1] ?? null;

export const getPreviousSetupStep = (step: number): SetupStep | null =>
  setupInfo[step - 1] ?? null;

export const incomeSources = [
  { label: "Salary", value: "salary" },
  { label: "Business", value: "business" },
  { label: "Freelance", value: "freelance" },
  { label: "Investments", value: "investments" },
  { label: "NYSC Allawee & Support", value: "nysc" },
  { label: "Online Income", value: "online" },
  { label: "Other", value: "other" },
];

export const CUSTOM_INCOME_SOURCE_VALUE = "other";

export const incomeRanges = [
  { label: "Below NGN 50,000", value: "below-50000" },
  { label: "NGN 50,000 - NGN 150,000", value: "50000-150000" },
  { label: "NGN 150,000 - NGN 300,000", value: "150000-300000" },
  { label: "NGN 300,000 - NGN 500,000", value: "300000-500000" },
  { label: "Above NGN 500,000", value: "above-500000" },
];

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

export const incomeSources = [
  { label: "Salary/Employment", value: "salary" },
  { label: "Business/Self-employed", value: "business" },
  { label: "Freelancing", value: "freelancing" },
  { label: "Multiple Sources", value: "multiple" },
  { label: "Student/No Income", value: "student", standAlone: true },
];

export const incomeRanges = [
  { label: "Below NGN 50,000", value: "below-50000" },
  { label: "NGN 50,000 - NGN 150,000", value: "50000-150000" },
  { label: "NGN 150,000 - NGN 300,000", value: "150000-300000" },
  { label: "NGN 300,000 - NGN 500,000", value: "300000-500000" },
  { label: "Above NGN 500,000", value: "above-500000" },
];

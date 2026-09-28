import { EsusuGroup, EsusuSummary } from "./types";

/**
 * Summary metrics matching the initial screen design:
 * Total Contribution: ₦0.00, Active Group: 0, 0% change.
 */
export const MOCK_ESUSU_SUMMARY: EsusuSummary = {
  totalContribution: 0,
  activeGroupCount: 0,
  growthPercentage: 0,
};

/**
 * Mock groups matching the design image.
 * The attached design image represents the initial/empty state (Total Contribution: ₦0.00, Active Group: 0, 0%).
 * To start in the exact empty state matching the image, this is set to an empty array.
 * To preview with populated groups, replace with SAMPLE_ESUSU_GROUPS below.
 */
export const MOCK_ESUSU_GROUPS: EsusuGroup[] = [];

/**
 * Sample groups matching the names from the drawer in the design image:
 * "Family Savings Circle" and "Weekly Business Fund", plus pending and completed circles
 * for testing group card components and tab filtering.
 */
export const SAMPLE_ESUSU_GROUPS: EsusuGroup[] = [
  {
    id: "group-1",
    name: "Family Savings Circle",
    contributionAmount: 50000,
    totalPool: 500000,
    currency: "NGN",
    frequency: "monthly",
    status: "active",
    memberCount: 6,
    totalMembers: 10,
    nextContributionDate: "15 Oct, 2026",
    payoutOrder: 4,
  },
  {
    id: "group-2",
    name: "Weekly Business Fund",
    contributionAmount: 25000,
    totalPool: 200000,
    currency: "NGN",
    frequency: "weekly",
    status: "active",
    memberCount: 4,
    totalMembers: 8,
    nextContributionDate: "05 Oct, 2026",
    payoutOrder: 2,
  },
  {
    id: "group-3",
    name: "Holiday Thrift Circle",
    contributionAmount: 20000,
    totalPool: 100000,
    currency: "NGN",
    frequency: "monthly",
    status: "pending",
    memberCount: 2,
    totalMembers: 5,
    nextContributionDate: "01 Nov, 2026",
    payoutOrder: 1,
  },
  {
    id: "group-4",
    name: "Q2 Equipment Contribution",
    contributionAmount: 100000,
    totalPool: 600000,
    currency: "NGN",
    frequency: "monthly",
    status: "completed",
    memberCount: 6,
    totalMembers: 6,
    nextContributionDate: "Completed",
    payoutOrder: 6,
  },
];

export type EsusuStatus = "active" | "pending" | "completed";

export type EsusuTabId = "all" | "active" | "pending" | "completed";

export type EsusuFrequency = "daily" | "weekly" | "monthly";

export interface EsusuGroup {
  id: string;
  name: string;
  contributionAmount: number;
  totalPool: number;
  currency: string;
  frequency: EsusuFrequency;
  status: EsusuStatus;
  memberCount: number;
  totalMembers: number;
  nextContributionDate: string;
  payoutOrder?: number;
}

export interface EsusuSummary {
  totalContribution: number;
  activeGroupCount: number;
  growthPercentage: number;
}

export interface EsusuTabItem {
  id: EsusuTabId;
  label: string;
  icon: string | number;
}

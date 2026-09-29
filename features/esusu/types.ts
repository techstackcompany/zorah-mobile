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
  pickerType?: PickerType;
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

export type PickerType = "rotation" | "manual" | "automatic";

export interface EsusuMember {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  selected?: boolean;
}

export interface CreateEsusuFormData {
  groupName: string;
  contributionAmount: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  totalRounds: string;
  startDate: string;
  groupImageUri?: string;
  penaltyFee: string;
  pickerType: PickerType;
  description: string;
  selectedMembers: string[];
}

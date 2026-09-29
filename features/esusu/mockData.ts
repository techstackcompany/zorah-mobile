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
 * Sample groups matching the dashboard design images: "Family Saving Circle"
 * (Active, Manual Picker), "University Savings" (Pending, Automatic Picker),
 * and "Office Contribution" (Completed, Fixed Pot / Rotation Picker).
 */
export const SAMPLE_ESUSU_GROUPS: EsusuGroup[] = [
  {
    id: "group-1",
    name: "Family Saving Circle",
    contributionAmount: 50000,
    totalPool: 500000,
    currency: "NGN",
    frequency: "monthly",
    status: "active",
    memberCount: 3,
    totalMembers: 10,
    nextContributionDate: "16 Dec, 2025",
    payoutOrder: 3,
    pickerType: "manual",
  },
  {
    id: "group-2",
    name: "University Savings",
    contributionAmount: 25000,
    totalPool: 125000,
    currency: "NGN",
    frequency: "monthly",
    status: "pending",
    memberCount: 3,
    totalMembers: 5,
    nextContributionDate: "16 Dec, 2025",
    payoutOrder: 3,
    pickerType: "automatic",
  },
  {
    id: "group-3",
    name: "Office Contribution",
    contributionAmount: 100000,
    totalPool: 1000000,
    currency: "NGN",
    frequency: "monthly",
    status: "completed",
    memberCount: 8,
    totalMembers: 10,
    nextContributionDate: "16 Dec, 2025",
    payoutOrder: 8,
    pickerType: "rotation",
  },
];

/**
 * Mock circle members matching the design image for Step 2 (Membership Management).
 */
export const MOCK_ESUSU_MEMBERS: import("./types").EsusuMember[] = [
  {
    id: "mem-1",
    name: "Adebayo360",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "mem-2",
    name: "Chiomatic",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "mem-3",
    name: "Ibrahimo@me",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "mem-4",
    name: "Shezy",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "mem-5",
    name: "Emeka_12",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "mem-6",
    name: "Aisha_Baby",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "mem-7",
    name: "Rema",
    phone: "+234-000-2636-37",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
  },
];

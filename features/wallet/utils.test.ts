import type { WalletOverviewResponse } from "@/src/api/types";
import {
  DEFAULT_WALLET_TIER,
  WALLET_INACTIVE_FALLBACK_MESSAGE,
  getWalletInactiveMessage,
  getWalletKycStatus,
  getWalletTier,
  isWalletActive,
} from "./utils";

// Verbatim from the backend when KYC has not been submitted.
const noWallet = {
  success: true,
  hasWallet: false,
  message: "Complete KYC to activate your wallet.",
} as const satisfies WalletOverviewResponse;

// docs/api-captures/wallet-endpoints.md §2 (2026-07-13).
const activeWallet = {
  success: true,
  account: {
    balance: 0,
    currency: "NGN",
    accountNumber: "1177214654",
    accountName: "Akeem Mudashiru",
    tier: 1,
    xpressCustomerId: "5f1ac220-840f-42c2-ad32-595d13e2b7b0",
    xpressWalletId: "7960f4c2-7f56-40a9-9c87-f36d684872f4",
  },
  kyc: { status: "pending", currentTier: 1 },
  recentTransactions: [],
  chartData: [],
  userSettings: { biometricEnabled: false },
} as const satisfies WalletOverviewResponse;

// docs/api-captures/zorah-api-responses.json (2026-05-01) — same endpoint, same
// account, but the backend omitted `chartData` entirely on this run.
const activeWalletWithoutChartData = {
  success: true,
  account: {
    balance: 0,
    currency: "NGN",
    accountNumber: "1153930846",
    accountName: "Akeem Oluwaseyi",
    tier: 1,
    xpressCustomerId: "efae9d45-43cb-4a7c-96dc-f771343be064",
    xpressWalletId: "839a7738-b615-4484-b6bc-cdd5e08e9496",
  },
  kyc: { status: "pending", currentTier: 1 },
  recentTransactions: [],
  userSettings: { biometricEnabled: true },
} as const satisfies WalletOverviewResponse;

describe("isWalletActive", () => {
  it("rejects the no-KYC response", () => {
    expect(isWalletActive(noWallet)).toBe(false);
  });

  it("accepts a provisioned wallet", () => {
    expect(isWalletActive(activeWallet)).toBe(true);
    expect(isWalletActive(activeWalletWithoutChartData)).toBe(true);
  });

  it("rejects undefined and null while the query is loading", () => {
    expect(isWalletActive(undefined)).toBe(false);
    expect(isWalletActive(null)).toBe(false);
  });

  it("rejects a body that omits account without saying hasWallet: false", () => {
    // Guards against a third shape appearing, which this endpoint has form for.
    // Cast through `unknown` on purpose: the point is to exercise a payload the
    // declared type says cannot happen.
    expect(
      isWalletActive({ success: true } as unknown as WalletOverviewResponse),
    ).toBe(false);
  });
});

describe("getWalletTier", () => {
  it("reads the live tier from a provisioned wallet", () => {
    expect(getWalletTier(activeWallet)).toBe(1);
    expect(
      getWalletTier({
        ...activeWallet,
        kyc: { status: "verified", currentTier: 2 },
      }),
    ).toBe(2);
  });

  it("returns null when there is no wallet, rather than implying tier 1", () => {
    expect(getWalletTier(noWallet)).toBeNull();
    expect(getWalletTier(undefined)).toBeNull();
  });

  it("falls back to tier 1 when kyc is missing from an active wallet", () => {
    const { kyc: _kyc, ...withoutKyc } = activeWallet;
    expect(getWalletTier(withoutKyc as unknown as WalletOverviewResponse)).toBe(
      DEFAULT_WALLET_TIER,
    );
  });
});

describe("getWalletKycStatus", () => {
  it("returns the live status for a provisioned wallet", () => {
    expect(getWalletKycStatus(activeWallet)).toBe("pending");
  });

  it("returns undefined when there is no wallet, so callers can fall back", () => {
    expect(getWalletKycStatus(noWallet)).toBeUndefined();
    expect(getWalletKycStatus(undefined)).toBeUndefined();
  });
});

describe("getWalletInactiveMessage", () => {
  it("prefers the backend's own message", () => {
    expect(getWalletInactiveMessage(noWallet)).toBe(
      "Complete KYC to activate your wallet.",
    );
  });

  it("falls back when the backend sends no message", () => {
    expect(
      getWalletInactiveMessage({
        success: true,
        hasWallet: false,
      } as unknown as WalletOverviewResponse),
    ).toBe(WALLET_INACTIVE_FALLBACK_MESSAGE);
    expect(getWalletInactiveMessage(undefined)).toBe(
      WALLET_INACTIVE_FALLBACK_MESSAGE,
    );
  });

  it("returns nothing for an active wallet", () => {
    expect(getWalletInactiveMessage(activeWallet)).toBe("");
  });
});

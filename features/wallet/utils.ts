import type {
  DefaultWalletOverviewResponse,
  WalletOverviewResponse,
} from "@/src/api/types";

// Tier every user starts on, and what we report when the wallet has not been
// provisioned yet.
export const DEFAULT_WALLET_TIER = 1;

export const WALLET_INACTIVE_FALLBACK_MESSAGE =
  "Complete your KYC verification to activate your wallet.";

/**
 * Narrows a `/wallet/overview` response to the arm that actually carries
 * `account` and `kyc`.
 *
 * Until KYC is submitted the endpoint answers 200 with
 * `{ success: true, hasWallet: false, message }` — no `account`, no `kyc`.
 * Reading either without narrowing throws, and an uncaught render error takes
 * the whole app down (there are no error boundaries).
 *
 * The `"account" in overview` check is deliberate belt-and-braces: this
 * endpoint has already shipped two different response shapes for the same
 * account, so we confirm the field is present rather than trusting `hasWallet`
 * alone.
 */
export const isWalletActive = (
  overview: WalletOverviewResponse | undefined | null,
): overview is DefaultWalletOverviewResponse =>
  !!overview && overview.hasWallet !== false && "account" in overview;

/**
 * KYC tier for display, or `null` when there is no tier to report — either the
 * wallet has not been provisioned yet or the query is still loading. Callers
 * must render an explicit "not active" state rather than implying tier 1.
 */
export const getWalletTier = (
  overview: WalletOverviewResponse | undefined | null,
): number | null => {
  if (!isWalletActive(overview)) return null;
  // `kyc` is required on this arm, but the backend has been inconsistent about
  // which keys it sends, so we tolerate it being absent.
  return overview.kyc?.currentTier ?? DEFAULT_WALLET_TIER;
};

/**
 * Live KYC status from the wallet, or `undefined` when there is no wallet to
 * read one from. Callers decide what to fall back to.
 */
export const getWalletKycStatus = (
  overview: WalletOverviewResponse | undefined | null,
): string | undefined =>
  isWalletActive(overview) ? overview.kyc?.status : undefined;

/**
 * The backend's explanation for why the wallet is unavailable, for display in
 * an empty state. Prefers the server's own copy so the message stays accurate
 * if the activation rules change.
 */
export const getWalletInactiveMessage = (
  overview: WalletOverviewResponse | undefined | null,
): string => {
  if (isWalletActive(overview)) return "";
  return overview?.message?.trim() || WALLET_INACTIVE_FALLBACK_MESSAGE;
};

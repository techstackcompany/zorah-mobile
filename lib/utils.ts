import COLORS from "@/constants/colors";
import { AxiosError, isAxiosError } from "axios";
import { ClassValue, clsx } from "clsx";
import { formatDistance } from "date-fns";
import { Alert, Platform } from "react-native";
import { twMerge } from "tw-merge";
import { WalletTransaction } from "../src/api/types";

export type TransformedTransaction = {
  id: string;
  title: string;
  description?: string;
  category: string;
  account: string;
  amount: number;
  timeAgo: string;
  type: "income" | "expense";
  createdAt: string;
};

export function transformTransaction(
  txn: WalletTransaction,
): TransformedTransaction {
  const isCredit = txn.type === "credit";
  const amount = isCredit ? Math.abs(txn.amount) : -Math.abs(txn.amount);

  const title =
    txn.metadata?.description ||
    (txn.purpose
      ? formatTransactionPurpose(txn.purpose)
      : isCredit
        ? "Credit"
        : "Debit");

  const category =
    txn.purpose !== "other"
      ? txn.purpose
      : txn.metadata?.category || (isCredit ? "Income" : "Expense");

  return {
    id: txn._id,
    title,
    description: undefined,
    category,
    account: "Wallet",
    amount,
    timeAgo: formatDistance(new Date(txn.createdAt), new Date(), {
      addSuffix: true,
    }),
    type: isCredit ? "income" : "expense",
    createdAt: txn.createdAt,
  };
}

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs));
};

export const getErrorMessage = (
  error: Error | AxiosError | unknown,
  fallback?: string,
): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  } else if (fallback) {
    return fallback;
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback ?? "An unknown error occurred";
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validatePassword = (password: string) => {
  return password.length >= 8;
};

export const validateName = (name: string) => {
  return name.trim().length >= 2;
};

export const maskEmail = (
  email: string,
  opts: { showLocal?: number; showDomain?: number; mask?: string } = {},
): string => {
  const { showLocal = 3, showDomain = 2, mask = "***" } = opts;
  if (!email || typeof email !== "string") return "";

  const parts = email.split("@");
  if (parts.length !== 2) return email;

  const [local, domain] = parts;

  const visibleLocal =
    local.length <= showLocal ? local : local.slice(0, showLocal) + mask;

  const [domainName, ...tldParts] = domain.split(".");
  const visibleDomain =
    domainName.length <= showDomain
      ? domainName
      : domainName.slice(0, showDomain) + mask;

  const tld = tldParts.join(".");

  return `${visibleLocal}@${visibleDomain}${tld ? "." + tld : ""}`;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

type ExtractUserDataOptions = {
  fallbackName?: string;
  fallbackInitials?: string;
  includePhone?: boolean;
};

type ExtractedUserData = {
  fullName: string;
  firstName: string;
  displayEmail: string;
  displayPhone?: string;
  initials: string;
};

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

export function extractUserData(
  userData: unknown,
  options: ExtractUserDataOptions = {},
): ExtractedUserData {
  const {
    fallbackName = "User",
    fallbackInitials = "U",
    includePhone = false,
  } = options;

  const safeUser = (userData ?? {}) as Record<string, unknown>;

  const resolvedName =
    (pickString(safeUser?.firstName) ?? fallbackName) +
    " " +
    (pickString(safeUser?.lastName) ?? "");
  const resolvedEmail = pickString(safeUser.email) ?? "";

  const resolvedPhone = includePhone
    ? (pickString(safeUser.phoneNumber) ?? "")
    : undefined;

  const nameParts = resolvedName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const computedInitials =
    nameParts.length >= 2
      ? nameParts
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("")
      : (nameParts[0]?.[0]?.toUpperCase() ?? fallbackInitials);

  return {
    fullName: resolvedName,
    firstName: nameParts[0] || fallbackName.split(" ")[0],
    displayEmail: resolvedEmail,
    ...(includePhone && { displayPhone: resolvedPhone }),
    initials: computedInitials,
  };
}

export function formatCurrentDate(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  return `${day} ${month}, ${year}`;
}

export function formatCurrencyWithSymbol(
  value: number,
  symbol: string,
  locale: string = "en-NG",
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
): string {
  const formatted = Number(value).toLocaleString(locale, options);
  return `${symbol}${formatted}`;
}

export function formatCurrency(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

export function formatTransactionPurpose(purpose: string): string {
  if (!purpose) return "";

  return purpose
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// === Color utilities ==== //

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);
  return rgbToHex(r, g, b);
}

export function getAccentColorForGroup(groupName: string): {
  accentColor: string;
  backgroundColor: string;
} {
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  const usePrimary = Math.abs(hash) % 2 === 0;
  const baseColor = usePrimary ? COLORS.primary_400 : COLORS.secondary_400;

  const variation = (Math.abs(hash) % 31) / 100;

  const baseRgb = hexToRgb(baseColor);
  const accentR = Math.max(
    0,
    Math.min(255, baseRgb.r + (variation > 0.15 ? 20 : -20)),
  );
  const accentG = Math.max(
    0,
    Math.min(255, baseRgb.g + (variation > 0.15 ? 20 : -20)),
  );
  const accentB = Math.max(
    0,
    Math.min(255, baseRgb.b + (variation > 0.15 ? 20 : -20)),
  );
  const accentColor = rgbToHex(accentR, accentG, accentB);

  const lightnessPercent = 70 + (Math.abs(hash) % 16);
  const backgroundColor = lightenColor(accentColor, lightnessPercent);

  return { accentColor, backgroundColor };
}

export function getBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function getTextColor(
  r: number,
  g: number,
  b: number,
  lightColor: string = "#FFFFFF",
  darkColor: string = "#000000",
): string {
  const brightness = getBrightness(r, g, b);
  return brightness > 128 ? darkColor : lightColor;
}

// === End of color utilities === //

export function addKeyboardBehavior() {
  return Platform.OS === "ios" ? "padding" : "height";
}

export function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const formatNairaCurrency = (value: number) => {
  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });

  return currencyFormatter.format(Math.abs(value));
};

export const generateColorsFromString = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return {
    background: `hsl(${hue}, 70%, 90%)`,
    accent: `hsl(${hue}, 70%, 50%)`,
    dark: `hsl(${hue}, 70%, 28%)`,
  };
};

export const extractArrayResData = (response: unknown, fallback = []) => {
  if (!response) {
    return fallback;
  }
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as any).data;
    return Array.isArray(data) ? data : [];
  }
  return [];
};
export const alertError = (message: string) => {
  Alert.alert("Something went wrong ", message, [{ text: "OK" }], {
    cancelable: true,
  });
};

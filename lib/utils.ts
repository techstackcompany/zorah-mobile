import COLORS from "@/constants/colors";
import { AxiosError, isAxiosError } from "axios";
import { ClassValue, clsx } from "clsx";
import { Platform } from "react-native";
import { twMerge } from "tw-merge";

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

/* ---------------------------------------------
   User Data Utilities
----------------------------------------------*/

type ExtractUserDataOptions = {
  fallbackName?: string;
  fallbackInitials?: string;
  includePhone?: boolean;
};

type ExtractedUserData = {
  displayName: string;
  displayEmail: string;
  displayPhone?: string;
  initials: string;
};

/**
 * Helper function to pick the first non-empty string from multiple values
 */
function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

/**
 * Extracts and formats user data from userData object.
 * Handles nested user objects and various field name variations.
 */
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
  const nestedUser =
    safeUser.user && typeof safeUser.user === "object"
      ? (safeUser.user as Record<string, unknown>)
      : null;

  // Extract name
  const resolvedName =
    pickString(
      safeUser.name,
      safeUser.fullName,
      nestedUser?.name,
      nestedUser?.fullName,
    ) ?? fallbackName;

  // Extract email
  const resolvedEmail =
    pickString(
      safeUser.email,
      nestedUser?.email,
      safeUser.userEmail,
      safeUser.contactEmail,
    ) ?? "";

  // Extract phone (optional)
  const resolvedPhone = includePhone
    ? (pickString(
        safeUser.phone,
        safeUser.phoneNumber,
        nestedUser?.phone,
        nestedUser?.phoneNumber,
        safeUser.contactPhone,
      ) ?? "")
    : undefined;

  // Compute initials from name
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
    displayName: resolvedName,
    displayEmail: resolvedEmail,
    ...(includePhone && { displayPhone: resolvedPhone }),
    initials: computedInitials,
  };
}

/* ---------------------------------------------
   Date Utilities
----------------------------------------------*/

/**
 * Formats the current date as "Day Month, Year" (e.g., "15 January, 2025")
 * @returns Formatted date string
 */
export function formatCurrentDate(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  return `${day} ${month}, ${year}`;
}

/* ---------------------------------------------
   Currency Utilities
----------------------------------------------*/

/**
 * Formats a number as currency with a custom symbol
 * @param value - The numeric value to format
 * @param symbol - The currency symbol to use (e.g., "₦", "$", "₵")
 * @param locale - The locale for number formatting (default: "en-NG")
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted currency string (e.g., "₦1,234.56")
 */
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

/**
 * Formats a number as Nigerian Naira currency (₦) with no decimal places
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "₦1,234")
 */
export function formatCurrency(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

/**
 * Formats a transaction purpose string to a readable title
 * Replaces underscores with spaces and capitalizes each word
 * @param purpose - The transaction purpose (e.g., "savings_contribution")
 * @returns Formatted title (e.g., "Savings Contribution")
 */
export function formatTransactionPurpose(purpose: string): string {
  if (!purpose) return "";
  
  return purpose
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/* ---------------------------------------------
   Color Utilities
----------------------------------------------*/

/**
 * Converts hex color to RGB
 */
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

/**
 * Converts RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Lightens a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);
  return rgbToHex(r, g, b);
}

/**
 * Generates a consistent color variant for a group based on its name.
 * Returns variants of primary or secondary colors only.
 * @param groupName - The name of the group
 * @returns Object with accentColor (for icon) and backgroundColor (lighter variant)
 */
export function getAccentColorForGroup(groupName: string): {
  accentColor: string;
  backgroundColor: string;
} {
  // Hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Determine if using primary or secondary color (50/50 split)
  const usePrimary = Math.abs(hash) % 2 === 0;
  const baseColor = usePrimary ? COLORS.primary_400 : COLORS.secondary_400;

  // Generate variant intensity (0-30% variation)
  const variation = (Math.abs(hash) % 31) / 100; // 0-0.3

  // Create accent color by slightly adjusting the base color
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

  // Generate lighter background color (70-85% lighter)
  const lightnessPercent = 70 + (Math.abs(hash) % 16); // 70-85%
  const backgroundColor = lightenColor(accentColor, lightnessPercent);

  return { accentColor, backgroundColor };
}


export function addKeyboardBehavior(){
  return Platform.OS === "ios" ? "padding" : "height"
}
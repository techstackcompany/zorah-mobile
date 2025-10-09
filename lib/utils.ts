import { AxiosError, isAxiosError } from "axios";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tw-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs));
};

export const getErrorMessage = (
  error: Error | AxiosError | unknown,
  fallback?: string,
) => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  } else if (fallback) {
    return fallback;
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
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
  opts: { showLocal?: number; showDomain?: number; mask?: string } = {}
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


  export const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

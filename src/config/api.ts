const GENERAL_CONFIG = {
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
};

export const API_CONFIG = {
  baseURL: "https://getzorah.com/api",
  ...GENERAL_CONFIG,
} as const;

export const FX_FINANCIAL_TIPS_CONFIG = {
  baseURL: "https://seal-app-jjgmw.ondigitalocean.app",
  ...GENERAL_CONFIG
};
export const COUNTRIES_CONFIG = {
  baseURL: "https://countriesnow.space/api/v0.1",
  ...GENERAL_CONFIG,
};

/**
 * API Configuration
 *
 * For production, set the API_BASE_URL environment variable.
 * Defaults to development server if not set.
 */
export const API_CONFIG = {
  baseURL: "https://getzorah.com/api",
  timeout: 30000,
} as const;

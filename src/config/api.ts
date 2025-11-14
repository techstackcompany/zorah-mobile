/**
 * API Configuration
 * 
 * For production, set the API_BASE_URL environment variable.
 * Defaults to development server if not set.
 */
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "http://13.48.253.14:4000/api",
  timeout: 30000, // 30 seconds
} as const;


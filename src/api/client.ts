import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
  raw?: AxiosError;
}

const TOKEN_KEYS = ["accessToken", "session"];

async function readFromStorage(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined" || !("localStorage" in window)) {
      return null;
    }
    return window.localStorage.getItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function getAuthToken(): Promise<string | null> {
  for (const key of TOKEN_KEYS) {
    const value = await readFromStorage(key);
    if (value) return value;
  }
  return null;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: "http://16.171.32.108:4000/api",
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] = "multipart/form-data";
  } else if (config.headers?.["Content-Type"] == null) {
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      "Something went wrong";

    return {
      status: axiosError.response?.status,
      message,
      data: axiosError.response?.data,
      raw: axiosError,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Unknown error",
    data: error,
  };
}

export async function apiRequest<TResponse>(
  config: AxiosRequestConfig,
): Promise<TResponse> {
  try {
    const response: AxiosResponse<TResponse> = await apiClient.request<TResponse>(
      config,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";

import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
} from "@/lib/persistedStorageConfig";
import {
  API_CONFIG,
  COUNTRIES_CONFIG,
  FX_FINANCIAL_TIPS_CONFIG,
} from "../config/api";
import { API_ENDPOINTS } from "./endpoints";

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
  raw?: AxiosError;
}

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}[] = [];

let onTokenRefreshFailure: (() => void) | null = null;

export function setTokenRefreshFailureHandler(handler: (() => void) | null) {
  onTokenRefreshFailure = handler;
}

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const baseClient: AxiosInstance = axios.create(API_CONFIG);
export const countriesClient: AxiosInstance = axios.create(COUNTRIES_CONFIG);

export const fxTipsClient: AxiosInstance = axios.create(
  FX_FINANCIAL_TIPS_CONFIG,
);

const loginEndpoint = API_ENDPOINTS.auth.login.url;
const registerEndpoint = API_ENDPOINTS.auth.register.url;

baseClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    const isLoginEndpoint = config.url?.includes(loginEndpoint);
    const isRegisterEndpoint = config.url?.includes(registerEndpoint);
    if (token && !isLoginEndpoint && !isRegisterEndpoint) {
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
  },
  (error) => {
    return Promise.reject(error);
  },
);

baseClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isRefreshTokenEndpoint = originalRequest.url?.includes(
      API_ENDPOINTS.auth.refreshToken.url,
    );

    const isLoginEndpoint = originalRequest.url?.includes(loginEndpoint);
    const isRegisterEndpoint = originalRequest.url?.includes(registerEndpoint);
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshTokenEndpoint &&
      !isLoginEndpoint &&
      !isRegisterEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return baseClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post<{
          accessToken?: string;
        }>(
          `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.refreshToken.url}`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const newAccessToken = response.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        await setAuthToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);

        return baseClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        await clearAuthTokens();
        onTokenRefreshFailure?.();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function handleApiError(
  error: unknown,
  fallbackMessage: string = "Something went wrong",
): ApiError {
  if (
    !isAxiosError(error) &&
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    ("status" in error || "data" in error || "raw" in error)
  ) {
    return error as ApiError;
  }

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;

    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      fallbackMessage;

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

export const apiRequest = async <TResponse>(
  config: AxiosRequestConfig,
  client = baseClient,
): Promise<TResponse> => {
  try {
    const response: AxiosResponse<TResponse> =
      await client.request<TResponse>(config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

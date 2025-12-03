import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "../config/api";
import { API_ENDPOINTS } from "./endpoints";

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
  raw?: AxiosError;
}

const TOKEN_KEYS = ["accessToken", "session"];
const REFRESH_TOKEN_KEY = "refreshToken";

async function readFromStorage(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeToStorage(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

async function removeFromStorage(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

async function getAuthToken(): Promise<string | null> {
  for (const key of TOKEN_KEYS) {
    const value = await readFromStorage(key);
    if (value) return value;
  }
  return null;
}

async function getRefreshToken(): Promise<string | null> {
  return readFromStorage(REFRESH_TOKEN_KEY);
}

async function setAuthToken(token: string): Promise<void> {
  await Promise.all([
    writeToStorage("accessToken", token),
    writeToStorage("session", token),
  ]);
}

async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    removeFromStorage("accessToken"),
    removeFromStorage("session"),
    removeFromStorage(REFRESH_TOKEN_KEY),
  ]);
}

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}[];

let lastLoginTime: number | null = null;
const LOGIN_GRACE_PERIOD = 2000;
export function setLastLoginTime() {
  lastLoginTime = Date.now();
}

let onTokenRefreshFailure: (() => void) | null = null;

export function setTokenRefreshFailureHandler(handler: () => void) {
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

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
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
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isRefreshTokenEndpoint = originalRequest.url?.includes(
      API_ENDPOINTS.auth.refreshToken.path,
    );

    const isLoginEndpoint = originalRequest.url?.includes(
      API_ENDPOINTS.auth.login.path,
    );

    const isWithinGracePeriod =
      lastLoginTime !== null && Date.now() - lastLoginTime < LOGIN_GRACE_PERIOD;

    // If error is 401 and we haven't retried yet and it's not the refresh/login endpoint
    // and we're not within the login grace period
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshTokenEndpoint &&
      !isLoginEndpoint &&
      !isWithinGracePeriod
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
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

        console.log("🔄 Attempting to refresh access token...");

        const response = await axios.post<{
          data?: { accessToken?: string; refreshToken?: string };
          accessToken?: string;
          refreshToken?: string;
        }>(
          `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.refreshToken.path}`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const newAccessToken = response.data?.accessToken;
        const newRefreshToken =
          response.data?.data?.refreshToken ||
          response.data?.refreshToken ||
          (response.data as any)?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        await setAuthToken(newAccessToken);
        if (newRefreshToken) {
          await writeToStorage(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        await clearAuthTokens();

        if (onTokenRefreshFailure) {
          onTokenRefreshFailure();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function handleApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
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
    const response: AxiosResponse<TResponse> =
      await apiClient.request<TResponse>(config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

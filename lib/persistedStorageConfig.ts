import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/constants/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export async function asyncStorageGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function asyncStorageSetItem(
  key: string,
  value: string,
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export async function asyncStorageRemoveItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export async function asyncStorageGetJSON<T = unknown>(
  key: string,
): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value == null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function asyncStorageSetJSON(
  key: string,
  value: unknown,
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function secureStoreGetItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function secureStoreSetItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

export async function secureStoreRemoveItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

export async function getAuthToken(): Promise<string | null> {
  return secureStoreGetItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return secureStoreGetItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await secureStoreSetItem(REFRESH_TOKEN_KEY, token);
}

export async function setAuthToken(token: string): Promise<void> {
  await secureStoreSetItem(TOKEN_KEY, token);
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    secureStoreRemoveItem(TOKEN_KEY),
    secureStoreRemoveItem(REFRESH_TOKEN_KEY),
  ]);
}

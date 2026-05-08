import { PIN_HASH_KEY } from "@/constants/auth";
import {
  secureStoreGetItem,
  secureStoreRemoveItem,
  secureStoreSetItem,
} from "@/lib/persistedStorageConfig";
import * as Crypto from "expo-crypto";

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
}

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await secureStoreSetItem(PIN_HASH_KEY, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = await secureStoreGetItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  const enteredHash = await hashPin(pin);
  return enteredHash === storedHash;
}

export async function clearPin(): Promise<void> {
  await secureStoreRemoveItem(PIN_HASH_KEY);
}

export async function hasPinStored(): Promise<boolean> {
  const stored = await secureStoreGetItem(PIN_HASH_KEY);
  return stored !== null;
}

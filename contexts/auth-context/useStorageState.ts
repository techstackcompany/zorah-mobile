import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useReducer } from "react";

/* ---------------------------------------------
    Small helper: async state hook
----------------------------------------------*/
type AsyncState<T> = [boolean, T | null];
type UseAsyncStateReturn<T> = [
  AsyncState<T>,
  (value: T | null) => Promise<void>,
];

function useAsyncState<T>(
  initialValue: AsyncState<T> = [true, null],
): UseAsyncStateReturn<T> {
  return useReducer(
    (state: AsyncState<T>, action: T | null = null): AsyncState<T> => [
      false,
      action,
    ],
    initialValue,
  ) as UseAsyncStateReturn<T>;
}

/* ---------------------------------------------
    SecureStore helpers
----------------------------------------------*/
export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/* ---------------------------------------------
   useStorageState hook (persistent state)
----------------------------------------------*/
export function useStorageState(key: string): UseAsyncStateReturn<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    SecureStore.getItemAsync(key).then((value) => {
      setState(value);
    });
  }, [key, setState]);

  const setValue = useCallback(
    async (value: string | null): Promise<void> => {
      setState(value);
      await setStorageItemAsync(key, value);
    },
    [key, setState],
  );

  return [state, setValue];
}

/* ---------------------------------------------
   useStorageState hook (persistent state)
----------------------------------------------*/
export function useAsyncStorageState(key: string): UseAsyncStateReturn<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    AsyncStorage.getItem(key).then((value) => {
      setState(value);
    });
  }, [key, setState]);

  const setValue = useCallback(
    async (value: string | null): Promise<void> => {
      setState(value);
      await setStorageItemAsync(key, value);
    },
    [key, setState],
  );

  return [state, setValue];
}



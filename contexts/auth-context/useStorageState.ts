import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useReducer } from "react";

/* ---------------------------------------------
    Small helper: async state hook
----------------------------------------------*/
type AsyncState<T> = [boolean, T | null];
type UseAsyncStateReturn<T> = [AsyncState<T>, (value: T | null) => void];

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
  }, [key]);

  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key],
  );

  return [state, setValue];
}

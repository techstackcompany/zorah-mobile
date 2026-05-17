import AsyncStorage from "@react-native-async-storage/async-storage";
import { focusManager, QueryClient } from "@tanstack/react-query";
import {
  PersistedClient,
  PersistQueryClientProvider,
  Persister,
} from "@tanstack/react-query-persist-client";
import { AppState } from "react-native";
import React, { PropsWithChildren } from "react";

const QUERY_CACHE_KEY = "rq:cache";

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener("change", (state) => {
    setFocused(state === "active");
  });
  return () => subscription.remove();
});

const asyncStoragePersister: Persister = {
  persistClient: async (client) => {
    try {
      const serialized = JSON.stringify(client);
      await AsyncStorage.setItem(QUERY_CACHE_KEY, serialized);
    } catch {}
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      const cached = await AsyncStorage.getItem(QUERY_CACHE_KEY);
      if (!cached) return undefined;
      return JSON.parse(cached) as PersistedClient;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem(QUERY_CACHE_KEY);
    } catch {}
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "online",
    },
  },
});

type ReactQueryProviderProps = PropsWithChildren;

export const ReactQueryProvider = ({ children }: ReactQueryProviderProps) =>
  React.createElement(
    PersistQueryClientProvider,
    {
      client: queryClient,
      persistOptions: {
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24 * 2,
        buster: "v1",
      },
      onSuccess: () => {
        queryClient.resumePausedMutations().catch(() => {});
      },
    },
    children,
  );

export const clearPersistedQueryCache = async () => {
  await asyncStoragePersister.removeClient();
};

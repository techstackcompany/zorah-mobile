import { SessionProvider } from "@/contexts/auth-context/SessionProvider";
import PushNotificationsProvider from "@/contexts/push-notifications/PushNotificationsProvider";
import RootNavigator from "@/navigation/RootNavigator";
import FontProvider from "@/providers/FontProvider";
import toastConfig from "@/providers/ToastConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  createAsyncStoragePersister,
} from "@tanstack/react-query-persist-client";
import Toast from "react-native-toast-message";
import "../global.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "pocketmonie-react-query",
  throttleTime: 1000,
});

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <SessionProvider>
        <FontProvider>
          <PushNotificationsProvider>
            <RootNavigator />
          </PushNotificationsProvider>
          <Toast config={toastConfig} />
        </FontProvider>
      </SessionProvider>
    </PersistQueryClientProvider>
  );
}

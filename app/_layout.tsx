import { SessionProvider } from "@/contexts/auth-context/SessionProvider";
import PushNotificationsProvider from "@/contexts/push-notifications/PushNotificationsProvider";
import { SettingsProvider } from "@/contexts/settings-context/SettingsProvider";
import RootNavigator from "@/navigation/RootNavigator";
import FontProvider from "@/providers/FontProvider";
import toastConfig from "@/providers/ToastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

export const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SettingsProvider>
          <FontProvider>
            <SafeAreaProvider>
              {/* <PushNotificationsProvider> */}
                <RootNavigator />
              {/* </PushNotificationsProvider> */}
            </SafeAreaProvider>
            <Toast config={toastConfig} />
          </FontProvider>
        </SettingsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

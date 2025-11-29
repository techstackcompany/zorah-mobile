import OfflineNotice from "@/components/offline/OfflineNotice";
import { SessionProvider } from "@/contexts/auth-context/SessionProvider";
import { NetworkProvider } from "@/contexts/network/NetworkProvider";
import PushNotificationsProvider from "@/contexts/push-notifications/PushNotificationsProvider";
import { SettingsProvider } from "@/contexts/settings-context/SettingsProvider";
import { ReactQueryProvider } from "@/lib/reactQuery";
import RootNavigator from "@/navigation/RootNavigator";
import FontProvider from "@/providers/FontProvider";
import toastConfig from "@/providers/ToastConfig";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <NetworkProvider>
        <SessionProvider>
          <SettingsProvider>
            <FontProvider>
              <SafeAreaProvider>
                <View className="flex-1">
                  <OfflineNotice />
                  {/* <PushNotificationsProvider> */}
                  <RootNavigator />
                  {/* </PushNotificationsProvider> */}
                </View>
              </SafeAreaProvider>
              <Toast config={toastConfig} />
            </FontProvider>
          </SettingsProvider>
        </SessionProvider>
      </NetworkProvider>
    </ReactQueryProvider>
  );
}

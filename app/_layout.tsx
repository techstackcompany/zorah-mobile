import OfflineNotice from "@/components/offline/OfflineNotice";
import { SessionProvider } from "@/contexts/auth-context/SessionProvider";
import { NetworkProvider } from "@/contexts/network/NetworkProvider";
import PushNotificationsProvider from "@/contexts/push-notifications/PushNotificationsProvider";
import { SettingsProvider } from "@/contexts/settings-context/SettingsProvider";
import { ReactQueryProvider } from "@/lib/reactQuery";
import RootNavigator from "@/navigation/RootNavigator";
import FontProvider from "@/providers/FontProvider";
import toastConfig from "@/providers/ToastConfig";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReactQueryProvider>
        <NetworkProvider>
          <SessionProvider>
            <PushNotificationsProvider>
              <SettingsProvider>
                <FontProvider>
                  <SafeAreaProvider>
                    <BottomSheetModalProvider>
                      <View className="flex-1">
                        <OfflineNotice />
                        <RootNavigator />
                      </View>
                    </BottomSheetModalProvider>
                  </SafeAreaProvider>
                  <Toast config={toastConfig} />
                </FontProvider>
              </SettingsProvider>
            </PushNotificationsProvider>
          </SessionProvider>
        </NetworkProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}

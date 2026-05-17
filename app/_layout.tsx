import OfflineNotice from "@/components/offline/OfflineNotice";
import { AppLockProvider } from "@/contexts/app-lock/AppLockContext";
import { useAppLock } from "@/contexts/app-lock/useAppLock";
import { SessionProvider } from "@/contexts/auth-context/SessionProvider";
import { NetworkProvider } from "@/contexts/network/NetworkProvider";
import PushNotificationsProvider from "@/contexts/push-notifications/PushNotificationsProvider";
import { SettingsProvider } from "@/contexts/settings-context/SettingsProvider";
import { ReactQueryProvider } from "@/lib/reactQuery";
import RootNavigator from "@/navigation/RootNavigator";
import FontProvider from "@/providers/FontProvider";
import toastConfig from "@/providers/ToastConfig";
import LockScreen from "@/screens/LockScreen";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PropsWithChildren, useMemo } from "react";
import { PanResponder, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ChildrenComponent />
    </GestureHandlerRootView>
  );
}

const ChildrenComponent = () => {
  return (
    <ReactQueryProvider>
      <NetworkProvider>
        <SessionProvider>
          <PushNotificationsProvider>
            <SettingsProvider>
              <AppLockProvider>
                <AppWrapper>
                  <FontProvider>
                    <BottomSheetModalProvider>
                      <OfflineNotice />
                      <RootNavigator />
                    </BottomSheetModalProvider>
                    <Toast config={toastConfig} />
                  </FontProvider>
                </AppWrapper>
              </AppLockProvider>
            </SettingsProvider>
          </PushNotificationsProvider>
        </SessionProvider>
      </NetworkProvider>
    </ReactQueryProvider>
  );
};

const AppWrapper = ({ children }: PropsWithChildren) => {
  const { markActive, isLocked } = useAppLock();
  console.log("isLocked", isLocked);
  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          markActive();
          return false;
        },
      }).panHandlers,
    [markActive],
  );
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} {...panHandlers}>
        {children}
        <LockScreen visible={isLocked} />
      </View>
    </SafeAreaProvider>
  );
};

import { useSession } from "@/contexts/auth-context/useSession";
import { useRegisterNotificationTokenMutation } from "@/src/api/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

const REGISTERED_TOKEN_KEY = "@push_notification_registered_token";

type PushNotificationsContextValue = {
  fcmToken: string | null;
  notification?: Notifications.Notification;
  isRegistered: boolean;
};

const PushNotificationsContext = createContext<
  PushNotificationsContextValue | undefined
>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotificationsContext() {
  const context = useContext(PushNotificationsContext);
  if (!context) {
    throw new Error(
      "usePushNotifications must be used within PushNotificationsProvider",
    );
  }
  return context;
}

export default function PushNotificationsProvider({
  children,
}: PropsWithChildren) {
  const { isAuthenticated } = useSession();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const isRegistered = useRef(false);
  const router = useRouter();

  const registerTokenMutation = useRegisterNotificationTokenMutation({
    onSuccess: async () => {
      if (fcmToken) {
        await AsyncStorage.setItem(REGISTERED_TOKEN_KEY, fcmToken);
        isRegistered.current = true;
      }
    },
    onError: () => {
      isRegistered.current = false;
    },
  });

  const checkIfTokenAlreadyRegistered = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const registeredToken =
          await AsyncStorage.getItem(REGISTERED_TOKEN_KEY);
        return registeredToken === token;
      } catch {
        return false;
      }
    },
    [],
  );

  const registerToken = useCallback(
    async (token: string) => {
      if (!isAuthenticated) {
        return;
      }

      const alreadyRegistered = await checkIfTokenAlreadyRegistered(token);
      if (alreadyRegistered) {
        isRegistered.current = true;
        return;
      }

      registerTokenMutation.mutate({ fcmToken: token });
    },
    [isAuthenticated, checkIfTokenAlreadyRegistered, registerTokenMutation],
  );

  useEffect(() => {
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      if (!isAuthenticated) return;
      const data = response.notification.request.content.data;
      if (data?.type === "bill-reminder" && data.billId) {
         setTimeout(() => {
           router.replace(`/(app)/bill-reminder/update-bill?billId=${data.billId}`);
         }, 500);
      }
    };

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      handleNotificationResponse(response);
    });

    // Check for cold start notification tap
    Notifications.getLastNotificationResponseAsync().then(response => {
       if (response) {
         handleNotificationResponse(response);
       }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [isAuthenticated, router]);

  useEffect(() => {
    const requestPermissionsAndGetToken = async () => {
      // 1. Setup Android channels
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("critical", {
          name: "Critical Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
        await Notifications.setNotificationChannelAsync("warning", {
          name: "Warning Notifications",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
        await Notifications.setNotificationChannelAsync("info", {
          name: "Information Notifications",
          importance: Notifications.AndroidImportance.LOW,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // 2. Request permissions on ALL platforms
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== "granted") {
        Toast.show({
          type: "info",
          text1: "Notifications Disabled",
          text2: "Enable notifications in Settings to get bill reminders.",
        });
        return;
      }

      // 3. Get FCM Token (Android only for now)
      let token;
      if (Platform.OS === "android") {
        try {
          token = (await Notifications.getDevicePushTokenAsync()).data;
        } catch (e: any) {
          console.log(e);
        }
      }
      return token;
    };

    requestPermissionsAndGetToken().then((token) => token && setFcmToken(token));
  }, []);

  useEffect(() => {
    if (fcmToken && isAuthenticated) {
      registerToken(fcmToken);
    }
  }, [fcmToken, isAuthenticated, registerToken]);

  

  const value: PushNotificationsContextValue = {
    fcmToken,
    notification,
    isRegistered: isRegistered.current,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

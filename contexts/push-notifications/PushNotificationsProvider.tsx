import { registerForPushNotificationsAsync } from "@/lib/pushNotification";
import * as Notifications from "expo-notifications";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type PushNotificationsContextValue = {
  expoPushToken: string;
  notification?: Notifications.Notification;
  sendTestNotification: () => Promise<void>;
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

export function usePushNotifications() {
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
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          console.log("Push token stored in context:", token);
        } else {
          console.warn("Push notification registration returned null");
          setExpoPushToken("");
        }
      })
      .catch((error: unknown) => {
        console.error("Error in push notification registration:", error);
        setExpoPushToken("");
      });

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Handle notification response if needed
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (!expoPushToken) return;
    console.log("expoPushToken", expoPushToken);
  }, [expoPushToken]);

  const value = useMemo(
    () => ({
      expoPushToken,
      notification,
      sendTestNotification,
    }),
    [expoPushToken, notification, sendTestNotification],
  );

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

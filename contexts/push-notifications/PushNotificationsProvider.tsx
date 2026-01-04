import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type PushNotificationsContextValue = {
  fcmToken: string | null;
  notification?: FirebaseMessagingTypes.RemoteMessage;
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

export const usePushNotifications = (isAuthenticated: boolean) => {
  const hasPermissions = useRef(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    async function requestUserPermission() {
      try {
        const authStatus = await messaging().requestPermission();
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log("Firebase Authorization status:", authStatus);
          console.log("FCM Token:", token);
          setFcmToken(token);
          hasPermissions.current = enabled;
        }
      } catch (error) {
        console.error("Error requesting Firebase permissions:", error);
      }
    }

    if (isAuthenticated && !hasPermissions.current) {
      requestUserPermission();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Foreground notification received:", remoteMessage);

      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || "New Notification",
            body: remoteMessage.notification.body || "",
            data: remoteMessage.data,
            sound: true,
          },
          trigger: null,
        });
      }
    });

    return unsubscribe;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification opened app from background:",
        remoteMessage.notification,
      );
      if (remoteMessage.data) {
        console.log("Notification data:", remoteMessage.data);
      }
    });

    return unsubscribe;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification opened app from quit state:",
            remoteMessage.notification,
          );
          if (remoteMessage.data) {
            console.log("Notification data:", remoteMessage.data);
          }
        }
      });
  }, [isAuthenticated]);

  return fcmToken;
};

export default function PushNotificationsProvider({
  children,
}: PropsWithChildren) {
  const fcmToken = useRef<string | null>(null);
  const [notification, setNotification] = useState<
    FirebaseMessagingTypes.RemoteMessage | undefined
  >();

  useEffect(() => {
    const getFCMToken = async () => {
      try {
        const token = await messaging().getToken();
        fcmToken.current = token;
        console.log("FCM Token:", token);
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
    };

    getFCMToken();

    const unsubscribe = messaging().onTokenRefresh((token) => {
      console.log("FCM Token refreshed:", token);
      fcmToken.current = token;
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Foreground notification received:", remoteMessage);
      setNotification(remoteMessage);

      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || "New Notification",
            body: remoteMessage.notification.body || "",
            data: remoteMessage.data,
            sound: true,
          },
          trigger: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const value: PushNotificationsContextValue = {
    fcmToken:fcmToken.current,
    notification,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

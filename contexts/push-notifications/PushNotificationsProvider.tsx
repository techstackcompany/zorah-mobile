import { useSession } from "@/contexts/auth-context/useSession";
import { useRegisterNotificationTokenMutation } from "@/src/api/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const REGISTERED_TOKEN_KEY = "@push_notification_registered_token";

type PushNotificationsContextValue = {
  fcmToken: string | null;
  notification?: FirebaseMessagingTypes.RemoteMessage;
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
    FirebaseMessagingTypes.RemoteMessage | undefined
  >();
  const [isRegistered, setIsRegistered] = useState(false);
  const registrationAttempted = useRef(false);

  const registerTokenMutation = useRegisterNotificationTokenMutation({
    onSuccess: async (response) => {
      if (fcmToken) {
        await AsyncStorage.setItem(REGISTERED_TOKEN_KEY, fcmToken);
        setIsRegistered(true);
        console.log("FCM token registered successfully:", response);
      }
    },
    onError: (error) => {
      console.log("Failed to register FCM token:", error.message);
      registrationAttempted.current = false;
    },
  });

  const checkIfTokenAlreadyRegistered = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const registeredToken =
          await AsyncStorage.getItem(REGISTERED_TOKEN_KEY);
        return registeredToken === token;
      } catch (error) {
        console.log("Error checking registered token:", error);
        return false;
      }
    },
    [],
  );

  const registerToken = useCallback(
    async (token: string) => {
      if (!isAuthenticated) {
        console.log("Skipping token registration: User not authenticated");
        return;
      }

      if (registrationAttempted.current) {
        console.log("Token registration already attempted");
        return;
      }

      const alreadyRegistered = await checkIfTokenAlreadyRegistered(token);
      if (alreadyRegistered) {
        console.log("Token already registered, skipping");
        setIsRegistered(true);
        return;
      }

      registrationAttempted.current = true;
      console.log("Registering FCM token with backend:", token);
      registerTokenMutation.mutate({ fcmToken: token });
    },
    [isAuthenticated, checkIfTokenAlreadyRegistered, registerTokenMutation],
  );

  useEffect(() => {
    const requestPermissionsAndGetToken = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log("Push notification permissions not granted");
          return;
        }

        console.log("Push notification permissions granted");

        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();

        if (token) {
          console.log("FCM Token obtained:", token);
          setFcmToken(token);
        } else {
          console.warn("FCM token not available");
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
    };

    requestPermissionsAndGetToken();
  }, []);

  useEffect(() => {
    if (fcmToken && isAuthenticated) {
      registerToken(fcmToken);
    }
  }, [fcmToken, isAuthenticated, registerToken]);

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
      console.log("FCM Token refreshed:", newToken);
      setFcmToken(newToken);
      registrationAttempted.current = false;
      setIsRegistered(false);

      if (isAuthenticated) {
        await AsyncStorage.removeItem(REGISTERED_TOKEN_KEY);
        await registerToken(newToken);
      }
    });

    return unsubscribe;
  }, [isAuthenticated, registerToken]);

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
  }, []);

  const value: PushNotificationsContextValue = {
    fcmToken,
    notification,
    isRegistered,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

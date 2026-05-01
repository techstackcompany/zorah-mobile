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
    onSuccess: async () => {
      if (fcmToken) {
        await AsyncStorage.setItem(REGISTERED_TOKEN_KEY, fcmToken);
        setIsRegistered(true);
      }
    },
    onError: () => {
      registrationAttempted.current = false;
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

      if (registrationAttempted.current) {
        return;
      }

      const alreadyRegistered = await checkIfTokenAlreadyRegistered(token);
      if (alreadyRegistered) {
        setIsRegistered(true);
        return;
      }

      registrationAttempted.current = true;
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
          return;
        }

        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();

        if (token) {
          setFcmToken(token);
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
    const unsubscribe = messaging().onNotificationOpenedApp((_remoteMessage) => {
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(() => {
        // no-op
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

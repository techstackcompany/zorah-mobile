import { usePushNotificationsContext } from "@/contexts/push-notifications/PushNotificationsProvider";
import { setAuthToken } from "@/src/api/client";
import * as Notifications from "expo-notifications";
import { Alert, Pressable, Text, View } from "react-native";

export default function PushNotificationTestScreen() {
  const { fcmToken, notification, isRegistered } =
    usePushNotificationsContext();

  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a local test notification from the app",
        data: { testData: "local notification test" },
        sound: true,
      },
      trigger: null,
    });
  };

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    >
      <View style={{ alignItems: "center", padding: 20 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          FCM Token Status
        </Text>
        <Text>Token: {fcmToken ? "Available" : "Not available"}</Text>
        <Text>Registered: {isRegistered ? "Yes" : "No"}</Text>
        {fcmToken && (
          <Text
            style={{ fontSize: 10, marginTop: 10, maxWidth: "90%" }}
            numberOfLines={3}
          >
            {fcmToken}
          </Text>
        )}
      </View>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          Last Notification
        </Text>
        <Text>Title: {notification?.notification?.title ?? "N/A"}</Text>
        <Text>Body: {notification?.notification?.body ?? "N/A"}</Text>
        <Text>
          Data: {notification?.data ? JSON.stringify(notification.data) : "N/A"}
        </Text>
      </View>
      <Pressable
        onPress={sendLocalNotification}
        style={{
          backgroundColor: "#1643F5",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Send Local Notification
        </Text>
      </Pressable>
      <Pressable
        onPress={async () => {
          await setAuthToken("fake-token-for-testing");
          Alert.alert(
            "Fake token set",
            "A fake auth token has been set for testing purposes. You can now test authenticated API calls and push notifications that require authentication.",
          );
        }}
        style={{
          backgroundColor: "#1643F5",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          set fake token (testing)
        </Text>
      </Pressable>
    </View>
  );
}

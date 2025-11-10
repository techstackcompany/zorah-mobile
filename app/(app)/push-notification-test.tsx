import { usePushNotifications } from "@/contexts/push-notifications/PushNotificationsProvider";
import { useCallback } from "react";
import { Button, Text, View } from "react-native";

export default function PushNotificationTestScreen() {
  const { expoPushToken, notification, sendTestNotification } =
    usePushNotifications();

  const handleSendNotification = useCallback(() => {
    void sendTestNotification();
  }, [sendTestNotification]);

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    >
      <Text>Your Expo push token: {expoPushToken || "Unavailable"}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>Title: {notification?.request.content.title ?? "N/A"}</Text>
        <Text>Body: {notification?.request.content.body ?? "N/A"}</Text>
        <Text>
          Data: {notification ? JSON.stringify(notification.request.content.data) : "N/A"}
        </Text>
      </View>
      <Button title="Press to Send Notification" onPress={handleSendNotification} />
    </View>
  );
}

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// export async function sendPushNotification(expoPushToken: string) {
//   const message = {
//     to: expoPushToken,
//     sound: "default",
//     title: "Original Title",
//     body: "And here is the body!",
//     data: { someData: "goes here" },
//   };

//   await fetch("https://exp.host/--/api/v2/push/send", {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       "Accept-encoding": "gzip, deflate",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(message),
//   });
// }

function handleRegistrationError(errorMessage: string) {
  console.error("Push Notification Registration Error:", errorMessage);
  // Return null instead of throwing to allow graceful handling
  // Don't show alert as it interrupts user flows (e.g., sign up)
  return null;
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  try {
    // Set up Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Check if running on a physical device
    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device");
      return handleRegistrationError(
        "Must use physical device for push notifications",
      );
    }

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
    }

    // Get project ID
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error("Project ID not found in Constants");
      return handleRegistrationError("Project ID not found");
    }

    // Get push token
    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
        // For Android, you may need to configure FCM credentials
        // See: https://docs.expo.dev/push-notifications/fcm-credentials/
      });
      const pushTokenString = pushToken.data;
      console.log("Push token registered successfully:", pushTokenString);
      return pushTokenString;
    } catch (tokenError: unknown) {
      const errorMessage =
        tokenError instanceof Error ? tokenError.message : String(tokenError);
      console.error("Error getting push token:", errorMessage);

      // Check if it's a Firebase initialization error
      if (
        errorMessage.includes("FirebaseApp") ||
        errorMessage.includes("FCM") ||
        errorMessage.includes("Firebase")
      ) {
        return handleRegistrationError(
          `Firebase not configured. Please follow the guide at https://docs.expo.dev/push-notifications/fcm-credentials/ to set up Firebase Cloud Messaging credentials for Android push notifications. Error: ${errorMessage}`,
        );
      }

      return handleRegistrationError(
        `Failed to get push token: ${errorMessage}`,
      );
    }
  } catch (error: unknown) {
    console.error("Unexpected error in push notification registration:", error);
    return handleRegistrationError(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

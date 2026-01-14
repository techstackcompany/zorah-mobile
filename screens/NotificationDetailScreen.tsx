import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { NotificationType } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

type NotificationConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  label: string;
};

const getNotificationConfig = (type: NotificationType): NotificationConfig => {
  switch (type) {
    case "bill_alert":
      return {
        icon: "alert-circle",
        iconColor: COLORS.darkRed,
        iconBackground: "#FFEBE2",
        label: "Bill Alert",
      };
    case "bill_reminder":
      return {
        icon: "time",
        iconColor: COLORS.amber,
        iconBackground: "#FFF8E6",
        label: "Bill Reminder",
      };
    default:
      return {
        icon: "notifications",
        iconColor: COLORS.primary_400,
        iconBackground: COLORS.primary_100,
        label: "Notification",
      };
  }
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
};

const NotificationDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string;
  }>();

  const config = getNotificationConfig(params.type);

  const handleGoToBills = () => {
    router.push("/bill-reminder");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notification",
          headerBackTitle: "Back",
        }}
      />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          <View className="rounded-3xl bg-white p-6">
            <View className="items-center">
              <View
                className="size-16 items-center justify-center rounded-full"
                style={{ backgroundColor: config.iconBackground }}
              >
                <Ionicons
                  name={config.icon}
                  size={32}
                  color={config.iconColor}
                />
              </View>

              <View
                className="mt-3 rounded-full px-3 py-1"
                style={{ backgroundColor: config.iconBackground }}
              >
                <Text
                  weight="medium"
                  className="text-xs"
                  style={{ color: config.iconColor }}
                >
                  {config.label}
                </Text>
              </View>

              <Text
                weight="bold"
                className="mt-4 text-center text-xl text-textColor"
              >
                {params.title}
              </Text>

              <Text className="mt-2 text-center text-xs text-textColor/50">
                {formatFullDate(params.createdAt)}
              </Text>
            </View>

            <View className="mt-6 rounded-2xl bg-lightMuted p-4">
              <Text className="text-center text-base leading-6 text-textColor/80">
                {params.message}
              </Text>
            </View>

            {(params.type === "bill_alert" ||
              params.type === "bill_reminder") && (
              <Pressable
                onPress={handleGoToBills}
                className="mt-6 items-center rounded-full bg-primary_400 py-4"
              >
                <Text weight="semibold" className="text-base text-white">
                  View Bills
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </MainContainer>
    </>
  );
};

export default NotificationDetailScreen;

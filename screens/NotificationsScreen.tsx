import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { capitalizeWord } from "@/lib/utils";
import {
  useGetNotificationsQuery,
  useReadNotificationMutation,
} from "@/src/api/hooks";
import { Notification, NotificationType } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

type NotificationConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

const getNotificationConfig = (type: NotificationType): NotificationConfig => {
  switch (type) {
    case "bill_alert":
      return {
        icon: "alert-circle",
        iconColor: COLORS.darkRed,
        iconBackground: "#FFEBE2",
      };
    case "bill_reminder":
      return {
        icon: "time",
        iconColor: COLORS.amber,
        iconBackground: "#FFF8E6",
      };
    default:
      return {
        icon: "notifications",
        iconColor: COLORS.primary_400,
        iconBackground: COLORS.primary_100,
      };
  }
};

const formatNotificationDate = (dateString: string) => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d, yyyy");
};

const formatNotificationTime = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

const NotificationsScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNotificationsQuery();
  console.log("notifications", notifications);

  const { mutate: markAsRead } = useReadNotificationMutation({
    onMutate: async ({
      notificationId,
    }): Promise<{ previousNotifications?: Notification[] }> => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "list"] });

      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
        "list",
      ]);

      queryClient.setQueryData<Notification[]>(
        ["notifications", "list"],
        (old) =>
          old?.map((n) =>
            n._id === notificationId ? { ...n, read: true } : n,
          ),
      );

      return { previousNotifications };
    },
    onError: (_err, _variables, onMutateResult) => {
      const context = onMutateResult as {
        previousNotifications?: Notification[];
      };
      if (context.previousNotifications) {
        queryClient.setQueryData(
          ["notifications", "list"],
          context.previousNotifications,
        );
      }
    },
  });

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead({ notificationId: notification._id });
    }

    router.push({
      pathname: "/notifications/[id]",
      params: {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
      },
    });
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View
        className="mb-4 size-16 items-center justify-center rounded-full"
        style={{ backgroundColor: COLORS.primary_100 }}
      >
        <Ionicons
          name="notifications-off-outline"
          size={32}
          color={COLORS.primary_400}
        />
      </View>
      <Text weight="semibold" className="text-lg text-textColor">
        No notifications yet
      </Text>
      <Text className="mt-2 text-center text-sm text-textColor/60">
        You&apos;ll see your bill reminders and alerts here
      </Text>
    </View>
  );

  const renderNotificationItem = (notification: Notification) => {
    const config = getNotificationConfig(notification.type);

    return (
      <Pressable
        key={notification._id}
        className="rounded-xl bg-white px-5 py-5"
        onPress={() => handleNotificationPress(notification)}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 flex-row items-center">
            <View
              className="mr-3 size-10 items-center justify-center rounded-full"
              style={{ backgroundColor: config.iconBackground }}
            >
              <Ionicons name={config.icon} size={22} color={config.iconColor} />
            </View>
            <Text
              weight={notification.read ? "medium" : "semibold"}
              className="flex-1 text-base"
            >
              {notification.title}
            </Text>
          </View>
          {!notification.read && (
            <View
              className="size-2.5 rounded-full"
              style={{ backgroundColor: COLORS.primary_400 }}
            />
          )}
        </View>

        <Text className="mt-3 text-sm text-textColor/70">
          {notification.message}
        </Text>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-xs text-textColor/60">
            {capitalizeWord(formatNotificationTime(notification.createdAt))}
          </Text>
          <Text className="text-xs text-textColor/60">
            {capitalizeWord(formatNotificationDate(notification.createdAt))}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={COLORS.primary_400} />
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center py-20">
              <View
                className="mb-4 size-16 items-center justify-center rounded-full"
                style={{ backgroundColor: "#FFEBE2" }}
              >
                <Ionicons
                  name="warning-outline"
                  size={32}
                  color={COLORS.darkRed}
                />
              </View>
              <Text weight="semibold" className="text-lg text-textColor">
                Something went wrong
              </Text>
              <Text className="mt-2 text-center text-sm text-textColor/60">
                We couldn&apos;t load your notifications
              </Text>
              <Pressable
                onPress={() => refetch()}
                className="mt-4 rounded-full bg-primary_400 px-6 py-3"
              >
                <Text weight="semibold" className="text-white">
                  Try Again
                </Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching && !isLoading}
                  onRefresh={refetch}
                  tintColor={COLORS.primary_400}
                />
              }
            >
              {notifications && notifications.length > 0 ? (
                <View className="gap-4">
                  {notifications.map(renderNotificationItem)}
                </View>
              ) : (
                renderEmptyState()
              )}
            </ScrollView>
          )}
        </View>
      </MainContainer>
    </>
  );
};

export default NotificationsScreen;

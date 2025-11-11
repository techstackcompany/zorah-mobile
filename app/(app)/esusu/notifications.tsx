import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";

const notifications = [
  {
    title: "Invite accepted",
    body: "Chidi joined the Family Savings Circle",
    time: "2 min ago",
  },
  {
    title: "Payment reminder",
    body: "Your weekly contribution is due tomorrow",
    time: "1 day ago",
  },
];

export default function EsusuNotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <MainContainer edges={["top", "left", "right"]} className="bg-lightMuted">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }}
        >
          {notifications.map((item) => (
            <View
              key={item.title}
              className="flex-row items-center gap-3 rounded-3xl bg-white px-4 py-4 shadow-sm"
            >
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary_100">
                <Ionicons name="notifications-outline" size={20} color="#1A43BE" />
              </View>
              <View className="flex-1">
                <Text weight="semibold" className="text-textColor">
                  {item.title}
                </Text>
                <Text className="text-sm text-textColor/60">{item.body}</Text>
              </View>
              <Text className="text-xs text-textColor/50">{item.time}</Text>
            </View>
          ))}
        </ScrollView>
      </MainContainer>
    </>
  );
}

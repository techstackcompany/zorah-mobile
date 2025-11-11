import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

const groups = [
  {
    name: "Weekly Business Fund",
    members: "8 members",
    amount: "₦25,000 weekly",
  },
  {
    name: "Family Savings Circle",
    members: "10 members",
    amount: "₦10,000 weekly",
  },
];

export default function JoinEsusuGroupScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Join Group" }} />
      <MainContainer edges={["top", "left", "right"]} className="bg-lightMuted">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }}
        >
          {groups.map((group) => (
            <View
              key={group.name}
              className="rounded-3xl border border-[#E3E6F0] bg-white p-5"
            >
              <Text weight="bold" className="text-lg text-textColor">
                {group.name}
              </Text>
              <Text className="mt-1 text-sm text-textColor/60">
                {group.members} · {group.amount}
              </Text>
              <Pressable className="mt-4 flex-row items-center justify-between rounded-2xl bg-primary_400 px-4 py-3">
                <Text weight="semibold" className="text-white">
                  Request to join
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </MainContainer>
    </>
  );
}

import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const tiers = [
  {
    level: "Tier 1",
    subtitle: "Basic account information completed",
    daily: "₦10,500.00",
    monthly: "₦50,500.00",
    createGroup: "No",
    joinGroup: "No",
    active: true,
    accent: "#DDE5FF",
    button: {
      label: "Current Level",
      solid: false,
    },
  },
  {
    level: "Tier 2",
    subtitle: "Other account information needed",
    daily: "₦137,500.00",
    monthly: "₦137,500.00",
    createGroup: "No",
    joinGroup: "Yes",
    accent: "#F2F3F7",
    button: {
      label: "Upgrade Account",
      solid: true,
      color: "#1A43BE",
    },
  },
  {
    level: "Tier 3",
    subtitle: "Other account information needed",
    daily: "₦137,500.00",
    monthly: "₦137,500.00",
    createGroup: "Yes",
    joinGroup: "Yes",
    accent: "#EFE3FF",
    button: {
      label: "Upgrade Account",
      solid: true,
      color: "#6C3BFF",
    },
  },
];

export default function UpgradeAccountScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7FB]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable className="rounded-full bg-white p-3 shadow-[0px_8px_30px_rgba(26,67,190,0.12)]">
            <Ionicons name="chevron-back" size={20} color="#1F2337" />
          </Pressable>
          <Text className="text-xl text-[#101326]" weight="semibold">
            Upgrade Account
          </Text>
          <Pressable className="rounded-full bg-white p-3 shadow-[0px_8px_30px_rgba(26,67,190,0.12)]">
            <Ionicons name="menu" size={20} color="#1F2337" />
          </Pressable>
        </View>

        <Text className="mt-4 text-[13px] text-[#8F95AD]">
          Level benefits are tied to the verification steps you complete.
        </Text>

        <View className="mt-6 space-y-4">
          {tiers.map((tier) => (
            <View
              key={tier.level}
              className="overflow-hidden rounded-[28px] border border-[#E4E4EB] bg-white px-5 py-6 shadow-[0px_20px_40px_rgba(22,27,56,0.08)]"
              style={{ borderColor: tier.active ? "#D1D8FF" : "#E4E4EB" }}
            >
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-[20px] text-[#101326]" weight="semibold">
                    {tier.level}
                  </Text>
                  <Text className="text-[13px] text-[#6B708B]">
                    {tier.subtitle}
                  </Text>
                </View>
                {tier.active && (
                  <View className="rounded-full border border-[#1B56FF] px-3 py-1">
                    <Text className="text-[12px] text-[#1B56FF]" weight="semibold">
                      Current Level
                    </Text>
                  </View>
                )}
              </View>

              <View className="mt-5 space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#686E8F]">Daily Transaction Limit</Text>
                  <Text className="text-[15px] text-[#0C1144]" weight="semibold">
                    {tier.daily}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#686E8F]">Monthly Transaction Limit</Text>
                  <Text className="text-[15px] text-[#0C1144]" weight="semibold">
                    {tier.monthly}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#686E8F]">Create Group Savings</Text>
                  <Text className="text-[15px] text-[#0C1144]" weight="semibold">
                    {tier.createGroup}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] text-[#686E8F]">Join Group Savings</Text>
                  <Text className="text-[15px] text-[#0C1144]" weight="semibold">
                    {tier.joinGroup}
                  </Text>
                </View>
              </View>

              <Pressable
                className={`mt-6 rounded-[18px] px-6 py-3 ${tier.button.solid ? "" : "border border-[#D0D4E8] bg-[#F4F6FF]"}`}
                style={{
                  backgroundColor: tier.button.solid ? tier.button.color : "#F4F6FF",
                }}
              >
                <Text
                  className={`text-center text-[15px] ${tier.button.solid ? "text-white" : "text-[#1A43BE]"}`}
                  weight="semibold"
                >
                  {tier.button.label}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

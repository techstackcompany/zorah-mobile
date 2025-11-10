import type { ComponentProps } from "react";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const menuItems: { label: string; icon: IoniconName; active?: boolean }[] = [
  {
    label: "Esusu/Ajo Dashboard",
    icon: "home-outline",
    active: true,
  },
  {
    label: "Create Group",
    icon: "add-circle-outline",
  },
  {
    label: "Join Group",
    icon: "people-outline",
  },
  {
    label: "Notifications",
    icon: "notifications-outline",
  },
  {
    label: "Refer & Earn",
    icon: "gift-outline",
  },
];

const filterTabs = ["All", "Active", "Pending", "Completed"];
const recentGroups = ["Family Savings Circle", "Weekly Business Fund"];

export default function EsusuDashboardScreen() {
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-[#323232]">
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingVertical: 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-center gap-8">
          <View
            style={{
              minWidth: 230,
              maxWidth: 280,
              flex: 1,
            }}
            className="rounded-[32px] bg-white px-6 py-8 shadow-[0px_10px_40px_rgba(0,0,0,0.1)]"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text className="text-[16px] text-[#1F2740]" weight="semibold">
                  Pocketmonie
                </Text>
              </View>
              <Pressable className="rounded-full bg-[#F2F2F8] p-2">
                <Ionicons name="close" size={16} color="#838791" />
              </Pressable>
            </View>

            <Text className="mt-8 text-[12px] uppercase text-[#8D94A8]">
              Esusu/Ajo
            </Text>

            <View className="mt-4 space-y-2">
              {menuItems.map((item) => (
                <Pressable
                  key={item.label}
                  className={cn(
                    "flex-row items-center justify-between rounded-2xl px-3 py-3",
                    item.active
                      ? "bg-[#E6F0FF]"
                      : "bg-[#F6F7FB]",
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={cn(
                        "h-10 w-10 items-center justify-center rounded-2xl",
                        item.active
                          ? "bg-[#D7E6FF]"
                          : "bg-[#EFF0F6]",
                      )}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.active ? "#1A43BE" : "#6C708E"}
                      />
                    </View>
                    <Text
                      className={cn(
                        "text-[15px]",
                        item.active ? "text-[#1A43BE]" : "text-[#4D5466]",
                      )}
                      weight={item.active ? "semibold" : "medium"}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={item.active ? "#1A43BE" : "#B8BCC9"}
                  />
                </Pressable>
              ))}
            </View>

            <Text className="mt-6 text-[12px] uppercase text-[#8D94A8]">
              Recent Groups
            </Text>

            <View className="mt-3 space-y-3">
              {recentGroups.map((group) => (
                <View
                  key={group}
                  className="flex-row items-center gap-3 rounded-2xl bg-[#F6F7FB] px-3 py-3"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E7F5FF] shadow-[0px_4px_10px_rgba(25,90,255,0.2)]">
                    <Ionicons name="people" size={18} color="#1B4CEF" />
                  </View>
                  <Text className="text-[14px] text-[#1F2740]" weight="semibold">
                    {group}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-8 rounded-[20px] border border-[#E9EDF3] bg-[#FDFEFF] px-3 py-3">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E6F0FF]">
                  <Text className="text-sm text-[#1A43BE]" weight="semibold">
                    JD
                  </Text>
                </View>
                <View>
                  <Text className="text-[15px] text-[#1F2740]" weight="semibold">
                    John Doe
                  </Text>
                  <Text className="text-[13px] text-[#8F93A5]">
                    john.doe@example.com
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              minWidth: 360,
              maxWidth: 520,
              flex: 1,
            }}
            className="rounded-[36px] bg-white p-6 shadow-[0px_20px_60px_rgba(0,0,0,0.15)]"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Pressable className="rounded-full bg-[#F2F4FF] p-2">
                  <Ionicons name="chevron-back" size={20} color="#121431" />
                </Pressable>
                <Text className="text-xl text-[#0B0F25]" weight="semibold">
                  Esusu/Ajo
                </Text>
              </View>
              <Pressable className="rounded-full bg-[#F2F4FF] p-2">
                <Ionicons name="menu" size={20} color="#121431" />
              </Pressable>
            </View>

            <View className="mt-8 flex-row items-center justify-between rounded-[24px] border border-[#EBEFF6] bg-[#F9FAFF] px-5 py-6">
              <View>
                <Text className="text-[12px] uppercase text-[#8F93A5]">
                  Total Contribution
                </Text>
                <Text className="text-3xl text-[#101326]" weight="semibold">
                  ₦0.00
                </Text>
              </View>
              <View className="items-end rounded-[16px] bg-[#E9FFF1] px-3 py-2">
                <Text className="text-[12px] text-[#1F8D44]">
                  Active Group
                </Text>
                <Text className="text-[14px] font-semibold text-[#1F8D44]">
                  0 / 0%
                </Text>
              </View>
            </View>

            <View className="mt-6 rounded-[26px] bg-[#EEF2FF] px-6 py-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-[#0E1225]" weight="semibold">
                  Group Savings
                </Text>
                <View className="rounded-full bg-[#D2DAFF] px-3 py-1">
                  <Text className="text-[12px] text-[#1E2E6A]">All</Text>
                </View>
              </View>
              <Text className="mt-2 text-[13px] text-[#5D6375]">
                Manage your Ajo/Esusu savings groups
              </Text>
              <Pressable className="mt-6 rounded-[20px] bg-[#1A43BE] px-5 py-3">
                <Text className="text-center text-[15px] text-white" weight="semibold">
                  Create New Group
                </Text>
              </Pressable>
            </View>

            <View className="mt-5 flex-row flex-wrap items-center gap-3">
              {filterTabs.map((tab, index) => (
                <Pressable
                  key={tab}
                  className={cn(
                    "rounded-[18px] px-4 py-2",
                    index === 0
                      ? "bg-[#1A43BE]"
                      : "border border-[#E4E6F1] bg-white",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[13px]",
                      index === 0 ? "text-white" : "text-[#5F6379]",
                    )}
                    weight={index === 0 ? "semibold" : "medium"}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mt-5 rounded-[22px] border border-[#E9EDF3] bg-[#F7F8FF] px-4 py-3">
              <View className="flex-row items-center">
                <Ionicons name="search" size={18} color="#9EA3B5" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search circle contribution..."
                  placeholderTextColor="#9EA3B5"
                  className="ml-3 flex-1 text-[14px] text-[#1F2437]"
                />
              </View>
            </View>

            <View className="mt-7 rounded-[28px] border border-[#E4E5EF] bg-white px-6 py-8 shadow-[0px_10px_40px_rgba(10,20,60,0.1)]">
              <Image
                source={require("@/assets/images/home/bonus.png")}
                style={{
                  alignSelf: "center",
                  height: 160,
                  width: 220,
                }}
                contentFit="contain"
              />
              <Text
                className="mt-5 text-center text-[16px] text-[#14172A]"
                weight="semibold"
              >
                No group savings
              </Text>
              <Text className="mt-2 text-center text-[13px] text-[#8A91A2]">
                All group savings will appear here
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

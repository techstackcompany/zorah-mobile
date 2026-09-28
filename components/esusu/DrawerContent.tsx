import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn, extractUserData } from "@/lib/utils";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ITEMS = [
  {
    key: "dashboard",
    label: "Esusu/Ajo Dashboard",
    icon: require("@/assets/icons/esusu/home.svg"),
    active: true,
  },
  {
    key: "create",
    label: "Create Group",
    icon: require("@/assets/icons/esusu/create.svg"),
    active: false,
  },
  {
    key: "join",
    label: "Join Group",
    icon: require("@/assets/icons/esusu/join.svg"),
    active: false,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: require("@/assets/icons/esusu/notifcations.svg"),
    active: false,
  },
  {
    key: "refer",
    label: "Refer & Earn",
    icon: require("@/assets/icons/esusu/refer_earn.svg"),
    active: false,
  },
] as const;

const RECENT_GROUPS = [
  {
    key: "family-savings",
    label: "Family Savings Circle",
    bgColor: "#EAF2FF",
    tintColor: COLORS.primary_400,
  },
  {
    key: "weekly-business",
    label: "Weekly Business Fund",
    bgColor: "#E6F9EE",
    tintColor: COLORS.secondary_500,
  },
] as const;

const DrawerContent = ({
  navigation,
}: {
  navigation: DrawerContentComponentProps["navigation"];
}) => {
  const { data: userData } = useGetUserProfileQuery();

  const { displayName, displayEmail, initials } = useMemo(() => {
    const extracted = extractUserData(userData, {
      fallbackName: "John Doe",
      fallbackInitials: "JD",
    });
    return {
      displayName: extracted.fullName.trim() || "John Doe",
      displayEmail: extracted.displayEmail || "john.doe@example.com",
      initials: extracted.initials,
    };
  }, [userData]);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      {/* Top Header: Logo + Close Button */}
      <View
        className="flex-row items-center justify-between"
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 130, height: 40 }}
          contentFit="contain"
        />
        <Pressable
          hitSlop={12}
          onPress={() => navigation.closeDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Close drawer"
        >
          <Image
            source={require("@/assets/icons/cancel.svg")}
            style={{
              width: 24,
              height: 24,
            }}
          />
        </Pressable>
      </View>

      {/* Main Navigation Menu */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Esusu/Ajo Section */}
        <Text
          family="nunito"
          weight="bold"
          className="mb-2 px-2 text-sm text-textColor/50"
        >
          Esusu/Ajo
        </Text>

        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => {
              navigation.closeDrawer();
              // TODO: wire to API / navigation
            }}
            className={cn(
              "mb-1 flex-row items-center rounded-xl px-3.5 py-3",
              item.active ? "bg-[#EEF3FF]" : "active:bg-gray-50",
            )}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Image
              source={item.icon}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
            <Text
              family="nunito"
              weight={item.active ? "bold" : "semibold"}
              className={cn(
                "ml-3 text-base",
                item.active ? "text-primary_400" : "text-textColor",
              )}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}

        {/* Recent Groups Section */}
        <Text
          family="nunito"
          weight="bold"
          className="mb-2 mt-6 px-2 text-sm text-textColor/50"
        >
          Recent Groups
        </Text>

        {RECENT_GROUPS.map((group) => (
          <Pressable
            key={group.key}
            onPress={() => {
              navigation.closeDrawer();
              // TODO: wire to API / navigation
            }}
            className="mb-1 flex-row items-center rounded-xl px-3.5 py-2.5 active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel={group.label}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: group.bgColor }}
            >
              <Image
                source={require("@/assets/icons/esusu/group.svg")}
                style={{ width: 18, height: 18 }}
                tintColor={group.tintColor}
                contentFit="contain"
              />
            </View>
            <Text
              family="nunito"
              weight="semibold"
              className="ml-3 text-base text-textColor"
            >
              {group.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* User Profile Footer */}
      <View className="flex-row items-center border-t border-gray-100 px-5 py-4">
        <View
          className="items-center justify-center rounded-full bg-primary_200"
          style={{ width: 40, height: 40 }}
        >
          <Text family="nunito" weight="bold" className="text-sm text-primary_400">
            {initials}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            family="nunito"
            weight="bold"
            className="text-sm text-textColor"
          >
            {displayName}
          </Text>
          <Text
            family="nunito"
            weight="regular"
            className="text-xs text-textColor/60"
            numberOfLines={1}
          >
            {displayEmail}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DrawerContent;

import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Text from "./Text";



type BottomNavItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
};


const bottomNavItems: BottomNavItem[] = [
  { id: "home", label: "Home", icon: "home", active: true },
  { id: "history", label: "History", icon: "time-outline" },
  { id: "portfolio", label: "Briefcase", icon: "briefcase-outline" },
  { id: "analytics", label: "Analytics", icon: "stats-chart" },
  { id: "profile", label: "Profile", icon: "person-circle-outline" },
];

const Tab = () => {
  return (
    <View className="rounded-full bg-primary_400 px-2 py-2">
      <View className="flex-row items-center justify-between">
        {bottomNavItems.map((item) => {
          const isActive = !!item.active;
          return (
            <Pressable
              key={item.id}
              className={cn(
                "flex-1 items-center justify-center py-2",
                isActive && "mx-1 flex-row gap-2 rounded-full bg-white px-3",
              )}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? COLORS.primary_400 : "#FFFFFF"}
              />
              {isActive ? (
                <Text weight="semibold" className="text-sm text-primary_400">
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default Tab;

const styles = StyleSheet.create({});

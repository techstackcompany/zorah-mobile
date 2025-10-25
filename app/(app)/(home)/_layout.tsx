import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  index: { label: "Home", icon: "home" },
  history: { label: "Budget", icon: "time-outline" },
  budget: { label: "Budget", icon: "time-outline" },
  portfolio: { label: "Briefcase", icon: "briefcase-outline" },
  analytics: { label: "Analytics", icon: "stats-chart" },
  profile: { label: "Profile", icon: "person-circle-outline" },
};

const HomeTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: bottom + 20 }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabItem = TAB_CONFIG[route.name] ?? {
            label: route.name,
            icon: "ellipse-outline" as keyof typeof Ionicons.glyphMap,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : undefined}
              accessibilityLabel={
                descriptors[route.key].options.tabBarAccessibilityLabel
              }
              onPress={onPress}
              onLongPress={onLongPress}
              className={cn(
                "mx-1  flex-row items-center justify-center rounded-full py-2",
                isFocused ? "min-w-[90px] bg-white px-4" : "px-2",
              )}
            >
              <Ionicons
                name={tabItem.icon}
                size={22}
                color={isFocused ? COLORS.primary_400 : "#FFFFFF"}
              />
              {isFocused ? (
                <Text
                  weight="semibold"
                  className="ml-2 text-sm text-primary_400"
                >
                  {tabItem.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const HomeLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "white",
          backgroundColor: "red",
        },
      }}
      tabBar={(props) => <HomeTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget Manager",
          tabBarLabelStyle: {},
          tabBarItemStyle: {},
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Briefcase",
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
};

export default HomeLayout;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "white",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary_400,
    borderRadius: 1000,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
});

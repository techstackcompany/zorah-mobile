import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Image, ImageSource } from "expo-image";
import { Tabs, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONFIG: Record<
  string,
  { label: string; iconSource: ImageSource }
> = {
  index: { label: "Home", iconSource: require("@/assets/icons/home.svg") },
  budget: { label: "Budget", iconSource: require("@/assets/icons/budget.svg") },
  investment: {
    label: "Investment",
    iconSource: require("@/assets/icons/investment.svg"),
  },
  fxRates: {
    label: "Fx Rates",
    iconSource: require("@/assets/icons/fxRates.svg"),
  },
  profile: {
    label: "Account",
    iconSource: require("@/assets/icons/profile.svg"),
  },
};

const HomeTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();
  const path = usePathname();
  return (
    <View style={[styles.wrapper, { paddingBottom: bottom + 20 }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tabItem = TAB_CONFIG[route.name] ?? {
            label: route.name,
            iconSource: require("@/assets/icons/more.svg"),
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
                "mx-1 flex-row items-center justify-center rounded-full py-2",
                isFocused ? "min-w-[90px] bg-white px-4" : "px-2",
              )}
            >
              <Image
                source={tabItem.iconSource}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? COLORS.primary_400 : "#FFFFFF" },
                ]}
                contentFit="contain"
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
  const path = usePathname();
  const shouldHideTabBar = path.startsWith("/budget/") || path.startsWith("/investment/") ;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: shouldHideTabBar
          ? { display: "none" }
          : {
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "white",
              backgroundColor: "red",
            },
      }}
      tabBar={(props) => (shouldHideTabBar ? null : <HomeTabBar {...props} />)}
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
        name="investment"
        options={{
          title: "Briefcase",
        }}
      />
      <Tabs.Screen
        name="fxRates"
        options={{
          title: "FX Rates",
          headerShown:true
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
  icon: {
    width: 22,
    height: 22,
  },
});

import { HeaderBack } from "@/components/ui/HeaderBack";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { stackOptions } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_CONFIG: Record<string, { label: string; iconSource: ImageSource }> = {
  index: { label: "Home", iconSource: require("@/assets/icons/home.svg") },
  budget: { label: "Budget", iconSource: require("@/assets/icons/budget.svg") },
  "expense-planning": {
    label: "Expenses",
    iconSource: require("@/assets/icons/expense.svg"),
  },
  profile: {
    label: "Account",
    iconSource: require("@/assets/icons/profile.svg"),
  },
};

const HomeTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "investment" && route.name !== "fxRates",
  );
  const focusedRoute = state.routes[state.index];
  const focusedIndex = visibleRoutes.findIndex(
    (route) => route.key === focusedRoute?.key,
  );

  return (
    <View
      style={[styles.wrapper, { paddingBottom: bottom + 10, paddingTop: 0 }]}
    >
      <View style={styles.container}>
        {visibleRoutes.map((route, index) => {
          const isFocused = index === focusedIndex;
          const tabItem = TAB_CONFIG[route.name] ?? {
            label: route.name,
            iconSource: require("@/assets/icons/more.svg"),
          };

          const onPress = () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ minHeight: 48, minWidth: 48 }}
              className={cn(
                "mx-1 flex-row items-center justify-center rounded-full py-1",
                isFocused ? "min-w-[90px] bg-white px-4" : "px-3",
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

const headerWithBack = {
  headerLeft() {
    return (
      <HeaderBack tintColor={COLORS.textColor} style={{ marginLeft: 16 }} />
    );
  },
};

const HomeLayout = () => {
  const path = usePathname();
  const router = useRouter();

  const handleAddBudget = () => {
    router.push("/budget/create");
  };

  const handleArchive = () => {
    router.push("/budget/archive");
  };
  const isProfileSubRoute = path.startsWith("/profile/");
  const shouldHideTabBar =
    path.startsWith("/budget/") ||
    path.startsWith("/investment/") ||
    isProfileSubRoute;
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: shouldHideTabBar ? { display: "none" } : undefined,
        headerShown: true,
        ...(stackOptions as BottomTabNavigationOptions),
      }}
      tabBar={(props) => (shouldHideTabBar ? null : <HomeTabBar {...props} />)}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget Manager",
          ...headerWithBack,
          headerRight: () => (
            <View className="flex-row items-center gap-2 pr-4">
              <Pressable
                onPress={handleAddBudget}
                className="h-10 w-10 items-center justify-center rounded-full "
                accessibilityRole="button"
                accessibilityLabel="Add budget"
              >
                <Image
                  source={require("@/assets/icons/add-budget.svg")}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
              <Pressable
                onPress={handleArchive}
                className="items-center justify-center rounded-full"
                accessibilityRole="button"
                accessibilityLabel="Archive budgets"
              >
                <Image
                  source={require("@/assets/icons/archive.svg")}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="expense-planning"
        options={{
          title: "Expense Planning",
          ...headerWithBack,
        }}
      />
      <Tabs.Screen
        name="fxRates"
        options={{
          title: "FX Rates",
          ...headerWithBack,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          ...headerWithBack,
        }}
      />
    </Tabs>
  );
};

export default HomeLayout;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary_400,
    borderRadius: 1000,
    padding: 8,
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

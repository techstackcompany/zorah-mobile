import HomeTabBar from "@/components/home/HomeTabBar";
import { AIAssistantFab } from "@/components/ui/AIAssistantFab";
import { HeaderBack } from "@/components/ui/HeaderBack";
import COLORS from "@/constants/colors";
import { stackOptions } from "@/constants/navigation";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

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
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: shouldHideTabBar ? { display: "none" } : undefined,
          headerShown: true,
          ...(stackOptions as BottomTabNavigationOptions),
        }}
        tabBar={(props) => <HomeTabBar {...props} hidden={shouldHideTabBar} />}
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
      <AIAssistantFab
        hidden={shouldHideTabBar}
        bottomOffset={path.startsWith("/expense-planning") ? 160 : 90}
      />
    </View>
  );
};

export default HomeLayout;

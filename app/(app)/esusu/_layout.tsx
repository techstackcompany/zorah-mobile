import SidebarContainer from "@/components/esusu/SidebarContainer";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { RelativePathString, usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { ComponentProps } from "react";
import { Pressable } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MenuItem = {
  label: string;
  icon: IoniconName;
  active?: boolean;
  path: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Esusu/Ajo Dashboard",
    icon: "home-outline",
    path: "/esusu",
  },
  {
    label: "Create Group",
    icon: "add-circle-outline",
    path: "/esusu/create-group",
  },
  { label: "Join Group", icon: "people-outline", path: "/esusu/join-group" },
  {
    label: "Notifications",
    icon: "notifications-outline",
    path: "/esusu/notifications",
  },
  { label: "Refer & Earn", icon: "gift-outline", path: "/esusu/refer-earn" },
];

const useMenuItems = () => {
  const router = useRouter();
  const pathname = usePathname();
  return menuItems.map((item) => ({
    ...item,
    active:
      (item.path !== "/esusu" && pathname.startsWith(item.path)) ||
      (item.path === "/esusu" && pathname === "/esusu"),
    onPress: () => {
      router.push(item.path as RelativePathString);
    },
  }));
};

const recentGroups = ["Family Savings Circle", "Weekly Business Fund"];

const DrawerMenuButton = () => {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => {
        navigation.dispatch(DrawerActions.openDrawer());
      }}
      className="me-6"
      accessibilityRole="button"
      accessibilityLabel="Open menu"
    >
      <Ionicons name="menu" size={24} color={COLORS.primary_400} />
    </Pressable>
  );
};

const EsusuRootLayout = () => {
  const router = useRouter();
  const sidebarMenuItems = useMenuItems();

  return (
    <Drawer
      screenOptions={{
        headerTitle: "Esusu/Ajo",
        headerTitleStyle: { fontFamily: "NunitoSemibold", fontSize: 20 },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} className="me-3 ms-6">
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>
        ),
        headerRight: () => <DrawerMenuButton />,
      }}
      drawerContent={() => (
        <SidebarContainer
          menuItems={sidebarMenuItems}
          recentGroups={recentGroups}
        />
      )}
    >
      <Drawer.Screen name="index" options={{}} />
      <Drawer.Screen
        name="create-group"
        options={{ headerRight: () => null }}
      />
      <Drawer.Screen name="join-group" options={{ headerShown: false }} />
      <Drawer.Screen name="notifications" options={{ headerShown: false }} />
      <Drawer.Screen name="refer-earn" options={{ headerShown: false }} />
    </Drawer>
  );
};

export default EsusuRootLayout;

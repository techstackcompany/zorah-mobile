import DrawerContent from "@/components/esusu/DrawerContent";
import { Image } from "expo-image";
import { Drawer } from "expo-router/drawer";
import { Pressable, useWindowDimensions } from "react-native";

export default function Layout() {
  const dimensions = useWindowDimensions();

  return (
    <Drawer
      drawerContent={({ navigation }) => (
        <DrawerContent navigation={navigation} />
      )}

      screenOptions={({ navigation }) => ({
        headerTitle: "Esusu/Ajo",
        headerTitleAlign: "left",
        drawerType: dimensions.width >= 768 ? "permanent" : "front",

        headerTitleStyle: {
          fontFamily: "NunitoSemibold",
        },
        headerStyle: {
          height: 120,
        },

        headerLeft: () => (
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
            style={{ marginLeft: 18, marginRight: 8 }}
          >
            <Image
              source={require("@/assets/icons/arrow-left.svg")}
              style={{
                width: 24,
                height: 24,
              }}
            />
          </Pressable>
        ),
        headerRight: () => (
          <Pressable
            style={{ marginRight: 18 }}
            onPress={() => navigation.toggleDrawer()}
          >
            <Image
              source={require("@/assets/icons/menu.svg")}
              style={{
                width: 24,
                height: 24,
              }}
            />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="create" options={{ headerShown: false }} />
    </Drawer>
  );
}

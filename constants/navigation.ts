import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import COLORS from "./colors";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

export const stackOptions:
  | NativeStackNavigationOptions
  | BottomTabNavigationOptions = {
  headerBackButtonDisplayMode: "minimal",
  headerTitleStyle: { fontFamily: "NunitoSemibold", fontSize: 18 },
  headerShadowVisible: false,
  statusBarStyle: "dark",
  headerStyle: { backgroundColor: COLORS.white },
};

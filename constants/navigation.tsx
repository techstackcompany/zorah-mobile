import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import COLORS from "./colors";

// Native-stack screens keep the native iOS 26 liquid-glass back button.
// JS headers (tabs, first screens of nested stacks) render HeaderBack,
// which mimics it via expo-glass-effect — keep both chevrons the same tint.
export const stackOptions:
  | NativeStackNavigationOptions
  | BottomTabNavigationOptions = {
  headerBackButtonDisplayMode: "minimal",
  headerTitleStyle: { fontFamily: "NunitoSemibold", fontSize: 18 },
  headerShadowVisible: false,
  statusBarStyle: "dark",
  headerStyle: { backgroundColor: COLORS.white },
  headerTintColor: COLORS.textColor,
};

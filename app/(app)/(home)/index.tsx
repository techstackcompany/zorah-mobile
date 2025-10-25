import COLORS from "@/constants/colors";
import HomeScreen from "@/screens/HomeScreen";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import React from "react";

export default function Index() {
  const isFocused = useIsFocused();

  return (
    <>
      {isFocused && <StatusBar backgroundColor={COLORS.primary_200} style="dark" translucent={false} />}
      <HomeScreen />
    </>
  );
}

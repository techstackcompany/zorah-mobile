import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

const Overlay = () => {
  return (
    <View className="flex-1 items-center justify-center bg-primary_400">
      <Ionicons name="lock-closed-outline" color={"white"} size={100} />
    </View>
  );
};

export default Overlay;


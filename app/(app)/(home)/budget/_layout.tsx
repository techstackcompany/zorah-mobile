import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const _layout = () => {
  return <Stack screenOptions={{statusBarStyle:'dark'}}>
    <Stack.Screen name="index" options={{title:"Budget Manager"}}/>
  </Stack>
};

export default _layout;

const styles = StyleSheet.create({});

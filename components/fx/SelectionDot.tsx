import React from "react";
import { View, StyleSheet } from "react-native";
import COLORS from "@/constants/colors";

export type SelectionDotProps = {
  selected: boolean;
};

export const SelectionDot = ({ selected }: SelectionDotProps) => (
  <View
    style={[
      styles.selectionDot,
      { borderColor: selected ? COLORS.primary_400 : "#D1D6DE" },
    ]}
  >
    {selected ? <View style={styles.selectionDotInner} /> : null}
  </View>
);

const styles = StyleSheet.create({
  selectionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  selectionDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary_400,
  },
});

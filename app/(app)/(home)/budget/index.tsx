import COLORS from "@/constants/colors";
import BudgetScreen from "@/screens/BudgetScreen";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import React from "react";

const BudgetIndex = () => {
  const isFocused = useIsFocused();

  return (
    <>
      {isFocused && <StatusBar backgroundColor={COLORS.primary_200} />}
      <BudgetScreen />
    </>
  );
};

export default BudgetIndex;

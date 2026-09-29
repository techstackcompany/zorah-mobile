import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";

export const DebtEmptyState = () => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    <Text
      family="nunito"
      weight="bold"
      className="mb-2 text-center text-base text-textColor"
    >
      No debts found
    </Text>
    <Text
      family="nunito"
      weight="regular"
      className="text-center text-sm text-textColor/50"
    >
      Adjust your filters or search term, or record a new debt.
    </Text>
  </View>
);

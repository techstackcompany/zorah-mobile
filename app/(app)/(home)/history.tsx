import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";

const HistoryScreen = () => {
  return (
    <MainContainer className="bg-light">
      <View className="flex-1 items-center justify-center px-6">
        <Text weight="semibold" className="text-lg text-textColor">
          History
        </Text>
        <Text className="mt-2 text-center text-sm text-textColor/60">
          Track your past transactions and spending once this section is ready.
        </Text>
      </View>
    </MainContainer>
  );
};

export default HistoryScreen;


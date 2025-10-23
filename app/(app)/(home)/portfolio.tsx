import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";

const PortfolioScreen = () => {
  return (
    <MainContainer className="bg-light">
      <View className="flex-1 items-center justify-center px-6">
        <Text weight="semibold" className="text-lg text-textColor">
          Portfolio
        </Text>
        <Text className="mt-2 text-center text-sm text-textColor/60">
          Monitor your assets and holdings here soon.
        </Text>
      </View>
    </MainContainer>
  );
};

export default PortfolioScreen;


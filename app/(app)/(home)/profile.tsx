import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";

const ProfileScreen = () => {
  return (
    <MainContainer className="bg-light">
      <View className="flex-1 items-center justify-center px-6">
        <Text weight="semibold" className="text-lg text-textColor">
          Profile
        </Text>
        <Text className="mt-2 text-center text-sm text-textColor/60">
          Manage your personal details and preferences here soon.
        </Text>
      </View>
    </MainContainer>
  );
};

export default ProfileScreen;


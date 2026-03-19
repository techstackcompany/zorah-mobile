import Text from "@/components/ui/Text";
import React from "react";
import { Image, Pressable, View } from "react-native";

type CompleteSetupCardProps = {
  onCompleteSetup: () => void;
};

const CompleteSetupCard: React.FC<CompleteSetupCardProps> = ({
  onCompleteSetup,
}) => {
  return (
    <View className="mt-4 flex-row items-center rounded-2xl bg-secondary_150 p-2.5">
      {/* Left Text Content */}
      <View className="flex-[2] pr-2">
        <Text
          weight="bold"
          className=" text-base leading-[20px] text-textColor"
        >
          Complete your onboarding to start making transactions
        </Text>
        <Text className="mt-1.5 text-xs leading-[18px] text-textColor/60">
          Link your bank, set a PIN, and verify your account in a few steps
        </Text>
        <Pressable
          className="mt-3.5 self-start rounded-[10px] bg-primary_400 px-5 py-2.5 active:opacity-85"
          onPress={onCompleteSetup}
        >
          <Text weight="semibold" className="text-[13px] text-white">
            Complete Setup
          </Text>
        </Pressable>
      </View>

      {/* Right Image */}
      <View className="h-24 flex-1 items-center justify-center">
        <Image
          source={require("@/assets/images/home/complete-setup.png")}
          style={{ width: "100%" }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default CompleteSetupCard;

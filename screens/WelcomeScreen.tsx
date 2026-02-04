import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

const WelcomeScreen = () => {
  const router = useRouter()
  return (
    <MainContainer className="justify-center px-6">
      <View className="flex-[2] justify-end mb-4">
        <Text
          family="degular"
          weight="semibold"
          className="mb-2 text-center text-[40px] leading-tight"
        >
          Smart Way to
          {"\n"}
          <Text
            italic
            family="degular"
            weight="semibold"
            className="text-secondary_400"
          >
            Master Your Money{" "}
          </Text>
        </Text>
        <Text className="text-center text-sm">
          One app for all your money goals—budget better, track spending, manage
          loans, and build lasting savings with ease.
        </Text>
      </View>
      <View className="flex-[3]">
        <Image
          style={{ width: "100%", height: "100%", marginTop: 30 }}
          source={require("@/assets/images/onboarding/welcome.png")}
          contentFit="contain"
        />
      </View>
      <Text
        weight="semibold"
        family="degular"
        className="mt-12 text-center text-4xl"
      >
        Welcome Onboard, let’s help you get started
      </Text>
      <View className="flex-[2] gap-5">
        <Button title="Sign Up" onPress={()=>router.navigate('/setup/kyc-details')} className="mt-auto" />
        <Button title="Sign In" onPress={()=>router.navigate('/signIn')}  variant="outline" />
      </View>
    </MainContainer>
  );
};

export default WelcomeScreen;

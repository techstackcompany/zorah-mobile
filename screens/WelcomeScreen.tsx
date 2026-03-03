import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, View } from "react-native";

const screenHeight = Dimensions.get("window").height;
const WelcomeScreen = () => {
  const router = useRouter();
  return (
    <MainContainer className="justify-center px-6">
      <View className="mb-2  justify-end">
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
      <View className="">
        <Image
          style={{
            width: "100%",
          }}
          source={require("@/assets/images/onboarding/welcome.png")}
          resizeMode="contain"
        />
      </View>
      <Text
        weight="semibold"
        family="degular"
        className=" text-center text-4xl"
      >
        Welcome Onboard, let’s help you get started
      </Text>
      <View className="mb-5 mt-3 opacity-80">
        <Text className=" text-center">⁠Track your Investments</Text>
        <Text className=" text-center">⁠ ⁠⁠Manage Ajo (Group Savings) </Text>
        <Text className=" text-center">⁠⁠Get Financial Advice</Text>
      </View>
      <View className=" gap-5">
        <Button
          title="Sign Up"
          onPress={() => router.navigate("/signUp")}
          className="mt-auto"
        />
        <Button
          title="Sign In"
          onPress={() => router.navigate("/signIn")}
          variant="outline"
        />
      </View>
    </MainContainer>
  );
};

export default WelcomeScreen;

import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View , ScrollView} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Goal = {
  id: string;
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  iconBackground: string;
};

const goals: Goal[] = [
  {
    id: "emergency",
    title: "Build Emergency Fund",
    description: "Save for unexpected expenses",
    iconName: "shield-plus-outline",
    iconColor: "#E7961B",
    iconBackground: "#FFF5E5",
  },
  {
    id: "rent",
    title: "Save for Rent/House",
    description: "Plan for housing expenses",
    iconName: "home-outline",
    iconColor: "#EB5757",
    iconBackground: "#FFECEC",
  },
  {
    id: "gadgets",
    title: "Buy New Phone/Gadget",
    description: "Save for unexpected expenses",
    iconName: "cellphone",
    iconColor: "#2F80ED",
    iconBackground: "#E8F1FF",
  },
  {
    id: "transport",
    title: "Transportation Goals",
    description: "Car, bike, or transport budget",
    iconName: "bus-side",
    iconColor: "#56CCF2",
    iconBackground: "#E9FBFF",
  },
  {
    id: "education",
    title: "Education/Skills",
    description: "Invest in learning and growth",
    iconName: "school-outline",
    iconColor: "#9B51E0",
    iconBackground: "#F5ECFF",
  },
  {
    id: "business",
    title: "Start a Business",
    description: "Build capital for your hustle",
    iconName: "briefcase-outline",
    iconColor: "#6D4C41",
    iconBackground: "#F8EFEA",
  },
];

const FinancialGoalsScreen = () => {
  const router = useRouter();

  const handlePrevious = () => {
    router.back();
  };

  const handleFinish = () => {
    router.push("/welcome");
  };

  return (
    <SetupContainer className="bg-light">
      <View className="flex-1">
        <SetupHeader
          currentStep={4}
          totalSteps={4}
          title="Financial Goals"
          description="What would you like to achieve with PocketMonie?"
        />

        <View className="flex-1 px-6 pb-6">
          <ScrollView className="mt-6 gap-8 flex-1">
            {goals.map((goal) => (
              <Pressable
                key={goal.id}
                className="flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4"
              >
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: goal.iconBackground }}
                >
                  <MaterialCommunityIcons
                    name={goal.iconName}
                    size={26}
                    color={goal.iconColor}
                  />
                </View>

                <View className="flex-1">
                  <Text family="degular" weight="semibold" className="text-base">
                    {goal.title}
                  </Text>
                  <Text className="mt-1 text-sm text-textColor/70">
                    {goal.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="mt-6 text-center text-xs text-textColor/60">
            You can set specific amounts and deadlines for your goals after setup
          </Text>

          <View className="mt-auto flex-row gap-4 pt-10">
            <Button
              title="Previous"
              variant="outline"
              className="flex-1"
              onPress={handlePrevious}
            />
            <Button
              title="Get Started"
              className="flex-1"
              onPress={handleFinish}
            />
          </View>
        </View>
      </View>
    </SetupContainer>
  );
};

export default FinancialGoalsScreen;

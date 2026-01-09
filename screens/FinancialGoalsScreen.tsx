import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { useSession } from "@/contexts/auth-context/useSession";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import { Image, ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

type Goal = {
  id: string;
  title: string;
  description: string;
  iconSource: ImageSource;
};

const goals: Goal[] = [
  {
    id: "emergency",
    title: "Build Emergency Fund",
    description: "Save for unexpected expenses",
    iconSource: require("@/assets/images/setup/emergency.svg"),
  },
  {
    id: "rent",
    title: "Save for Rent/House",
    description: "Plan for housing expenses",
    iconSource: require("@/assets/images/setup/rent.svg"),
  },
  {
    id: "gadgets",
    title: "Buy New Phone/Gadget",
    description: "Save for unexpected expenses",
    iconSource: require("@/assets/images/setup/gadget.svg"),
  },
  {
    id: "transport",
    title: "Transportation Goals",
    description: "Car, bike, or transport budget",
    iconSource: require("@/assets/images/setup/transport.svg"),
  },
  {
    id: "education",
    title: "Education/Skills",
    description: "Invest in learning and growth",
    iconSource: require("@/assets/images/setup/education.svg"),
  },
  {
    id: "business",
    title: "Start a Business",
    description: "Build capital for your hustle",
    iconSource: require("@/assets/images/setup/business.svg"),
  },
];

const FinancialGoalsScreen = () => {
  const router = useRouter();
  const { setHasCompletedSetup, setSetupStep } = useSession();
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  useSetUpStep(4);

  const handlePrevious = () => {
    setSetupStep(3);
    router.back();
  };

  const handleFinish = () => {
    setHasCompletedSetup(true);
    setSetupStep(null);
    router.replace("/(app)/(home)");
  };

  return (
    <SetupContainer className="bg-light">
      <View className="flex-1">
        <SetupHeader
          currentStep={4}
          totalSteps={4}
          title="Financial Goals"
          description="What would you like to achieve with Zorah?"
        />

        <View className="flex-1 px-6 pb-6">
          <ScrollView
            className="mt-6 flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-8">
              {goals.map((goal) => (
                <Pressable
                  key={goal.id}
                  className={cn(
                    "flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4",
                    selectedGoals.includes(goal.id) &&
                      "border-primary_400 bg-primary_100",
                  )}
                  onPress={() =>
                    setSelectedGoals((prev) =>
                      prev.includes(goal.id)
                        ? prev.filter((id) => id !== goal.id)
                        : [...prev, goal.id],
                    )
                  }
                >
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl">
                    <Image
                      source={goal.iconSource}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      family="degular"
                      weight="semibold"
                      className="text-base"
                    >
                      {goal.title}
                    </Text>
                    <Text className="mt-1 text-sm text-textColor/70">
                      {goal.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text className="mt-6 text-center text-xs text-textColor/60">
            You can set specific amounts and deadlines for your goals after
            setup
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

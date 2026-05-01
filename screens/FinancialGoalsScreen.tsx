import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { setupInfo } from "@/constants";
import { useSession } from "@/contexts/auth-context/useSession";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/api/client";
import { useUpdateOnboardingMutation } from "@/src/api/hooks";
import { Image, ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

type Goal = {
  id: string;
  title: string;
  description: string;
  iconSource: ImageSource;
};

const goals: Goal[] = [
  {
    id: "rent",
    title: "Save for Rent",
    description: "Be ready before rent is due",
    iconSource: require("@/assets/images/setup/rent.svg"),
  },
  {
    id: "gadgets",
    title: "Buy a New Gadget",
    description: "Save up for your next phone/Laptop",
    iconSource: require("@/assets/images/setup/gadget.svg"),
  },
  {
    id: "transport",
    title: "Mobility Goals",
    description: "Plan and save for a car",
    iconSource: require("@/assets/images/setup/transport.svg"),
  },
  {
    id: "education",
    title: "Education / Skill Acquisition",
    description: "Save for learning and career growth",
    iconSource: require("@/assets/images/setup/education.svg"),
  },
  {
    id: "business",
    title: "Start a Business",
    description: "Build capital for your business",
    iconSource: require("@/assets/images/setup/business.svg"),
  },
  {
    id: "emergency",
    title: "Build Emergency Fund",
    description: "Save for unexpected expenses",
    iconSource: require("@/assets/images/setup/emergency.svg"),
  },
];

const normalizeStringList = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const goalsByNormalizedKey = new Map<string, Goal>(
  goals.flatMap((goal) => [
    [goal.id.toLowerCase(), goal],
    [goal.title.toLowerCase(), goal],
  ]),
);

const mapGoalEntriesToIds = (entries: string[]) => {
  const mapped = entries
    .map((entry) => goalsByNormalizedKey.get(entry.toLowerCase())?.id)
    .filter((entry): entry is string => Boolean(entry));

  return Array.from(new Set(mapped));
};

const FinancialGoalsScreen = () => {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const updateOnboardingMutation = useUpdateOnboardingMutation();
  const { setSetupStep, goToNextStep } = useSetUpStep(1);
  const { userData } = useSession();

  const prefilledGoalIds = React.useMemo(() => {
    const safeUserData = (userData ?? {}) as Record<string, unknown>;
    const onboarding =
      safeUserData.onboarding && typeof safeUserData.onboarding === "object"
        ? (safeUserData.onboarding as Record<string, unknown>)
        : null;

    const rawGoals =
      onboarding?.financialGoals ??
      safeUserData.financialGoals ??
      safeUserData.goals;

    return mapGoalEntriesToIds(normalizeStringList(rawGoals));
  }, [userData]);

  const prefilledGoalTitles = React.useMemo(
    () =>
      goals
        .filter((goal) => prefilledGoalIds.includes(goal.id))
        .map((goal) => goal.title),
    [prefilledGoalIds],
  );

  useEffect(() => {
    if (prefilledGoalIds.length === 0) {
      return;
    }

    setSelectedGoals((prev) => (prev.length > 0 ? prev : prefilledGoalIds));
  }, [prefilledGoalIds]);

  const handlePrevious = () => {
    setSetupStep(null);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(home)");
    }
  };

  const handleFinish = async () => {
    const selectedGoalTitles = goals
      .filter((goal) => selectedGoals.includes(goal.id))
      .map((goal) => goal.title);
    if (
      prefilledGoalTitles.length > 0 &&
      selectedGoalTitles.length === prefilledGoalTitles.length &&
      selectedGoalTitles.every((title) => prefilledGoalTitles.includes(title))
    ) {
      goToNextStep();
      return;
    }
    try {
      await updateOnboardingMutation.mutateAsync({
        step: setupInfo[1].key,
        data: { financialGoals: selectedGoalTitles },
      });

      goToNextStep();
    } catch (error) {
      const apiError = error as ApiError;

      Toast.show({
        type: "error",
        text1: "Could not save setup",
        text2: apiError?.message ?? "Please try again in a moment.",
      });
    }
  };

  return (
    <SetupContainer className="bg-light">
      <View className="flex-1">
        <SetupHeader
          currentStep={1}
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
              title="Cancel"
              variant="outline"
              className="flex-1"
              onPress={handlePrevious}
            />
            <Button
              title="Next"
              className="flex-1"
              onPress={handleFinish}
              disabled={
                selectedGoals.length === 0 || updateOnboardingMutation.isPending
              }
              loading={updateOnboardingMutation.isPending}
            />
          </View>
        </View>
      </View>
    </SetupContainer>
  );
};

export default FinancialGoalsScreen;

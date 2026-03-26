import { setupInfo } from "@/constants/setup";
import { useSession } from "@/contexts/auth-context/useSession";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type SetupStepKey = "financial-goals" | "income" | "kyc" | "banks";

export interface SetupStepInfo {
  key: SetupStepKey;
  title: string;
  completed: boolean;
  route: string;
}

const BANKS_COMPLETED_KEY = "@setup_banks_completed";

export const setLocalSetupFlag = async (key: "banks", value: boolean) => {
  try {
    const storageKey = BANKS_COMPLETED_KEY;
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set local setup flag for ${key}:`, error);
  }
};

function checkIfSetupStepCompleted(userData: any, stepKey: string): boolean {
  return userData?.onboarding?.stepsCompleted?.includes(stepKey) ?? false;
}

export const useSetupProgress = () => {
  const { userData } = useSession();
  const [localBanksCompleted, setLocalBanksCompleted] = useState(false);

  useEffect(() => {
    const fetchLocalFlags = async () => {
      try {
        const banksFlag = await AsyncStorage.getItem(BANKS_COMPLETED_KEY);

        if (banksFlag) setLocalBanksCompleted(JSON.parse(banksFlag));
      } catch (error) {
        console.error("Failed to fetch local setup flags:", error);
      }
    };

    fetchLocalFlags();
  }, []);

  const financialGoalsCompleted =
    Array.isArray(userData?.onboarding?.financialGoals) &&
    userData.onboarding.financialGoals.length > 0 &&
    checkIfSetupStepCompleted(userData, setupInfo[1].key);

  const incomeCompleted =
    Array.isArray(userData?.onboarding?.incomeSource) &&
    userData.onboarding.incomeSource.length > 0 &&
    checkIfSetupStepCompleted(userData, setupInfo[2].key);
  const kycCompleted =
    // userData?.KycStatus !== undefined &&
    // userData?.KycStatus !== "unverified" &&
    checkIfSetupStepCompleted(userData, setupInfo[3].key);

  const banksCompleted =
    localBanksCompleted &&
    checkIfSetupStepCompleted(userData, setupInfo[4].key);

  const steps: SetupStepInfo[] = [
    {
      key: "financial-goals",
      title: "Financial Goals",
      completed: financialGoalsCompleted,
      route: "/(app)/setup/financial-goals",
    },
    {
      key: "income",
      title: "Monthly Income",
      completed: incomeCompleted,
      route: "/(app)/setup/monthly-income",
    },
    {
      key: "kyc",
      title: "Identity Verification",
      completed: kycCompleted,
      route: "/(app)/setup/kyc",
    },
    {
      key: "banks",
      title: "Bank Integration",
      completed: banksCompleted,
      route: "/(app)/setup/your-banks",
    },
  ];
  console.log("kycCompleted", kycCompleted);
  const completedCount = steps.filter((step) => step.completed).length;
  const isSetupComplete =
    banksCompleted &&
    kycCompleted &&
    incomeCompleted &&
    financialGoalsCompleted;

  const currentStepIndex = steps.findIndex((step) => !step.completed);
  console.log("currentStepIndex", steps, currentStepIndex);
  return {
    steps,
    currentStepIndex: currentStepIndex === -1 ? 0 : currentStepIndex,
    isSetupComplete,
    completedCount,
    totalSteps: steps.length,
    currentStepRoute:
      currentStepIndex === -1 ? steps[0].route : steps[currentStepIndex].route,
  };
};

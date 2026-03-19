import { useSession } from "@/contexts/auth-context/useSession";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type SetupStepKey =
  | "financial-goals"
  | "income"
  | "kyc"
  | "banks"
  | "biometrics";

export interface SetupStepInfo {
  key: SetupStepKey;
  title: string;
  completed: boolean;
  route: string;
}

const INCOME_COMPLETED_KEY = "@setup_income_completed";
const BANKS_COMPLETED_KEY = "@setup_banks_completed";

export const setLocalSetupFlag = async (
  key: "income" | "banks",
  value: boolean,
) => {
  try {
    const storageKey =
      key === "income" ? INCOME_COMPLETED_KEY : BANKS_COMPLETED_KEY;
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set local setup flag for ${key}:`, error);
  }
};

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
    userData.onboarding.financialGoals.length > 0;

  const incomeCompleted =
    Array.isArray(userData?.onboarding?.incomeSource) &&
    userData.onboarding.incomeSource.length > 0;
  const kycCompleted =
    userData?.KycStatus !== undefined && userData?.KycStatus !== "unverified";

  const banksCompleted = localBanksCompleted;

  const biometricsCompleted = userData?.hasPin === true;

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
      completed: true,
      route: "/(app)/setup/your-banks",
    },
    {
      key: "biometrics",
      title: "Security & Biometrics",
      completed: biometricsCompleted,
      route: "/(app)/setup/biometric-setup",
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;
  const isSetupComplete =
    banksCompleted &&
    biometricsCompleted &&
    kycCompleted &&
    incomeCompleted &&
    financialGoalsCompleted;
  const currentStepIndex = steps.findIndex((step) => !step.completed);
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

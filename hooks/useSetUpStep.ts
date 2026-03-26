import { setupInfo } from "@/constants/setup";
import { useSession } from "@/contexts/auth-context/useSession";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const useSetUpStep = (step: number) => {
  const { setupStep, setSetupStep } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!Number.isFinite(step)) return;
    if (setupStep === step) return;
    if (setupStep == null || setupStep < step) {
      setSetupStep(step);
    }
  }, [setSetupStep, setupStep, step]);

  return {
    setupStep,
    setSetupStep,
    goToNextStep: () => {
      setSetupStep(step + 1);
      router.push(setupInfo[step + 1].route);
    },
    goToPreviousStep: () => {
      setSetupStep(step - 1);
      router.navigate(setupInfo[step - 1].route);
    },
  } as const;
};

export default useSetUpStep;

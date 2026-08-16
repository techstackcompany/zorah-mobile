import { getNextSetupStep, getPreviousSetupStep } from "@/constants/setup";
import { useSession } from "@/contexts/auth-context/useSession";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const useSetUpStep = (step: number) => {
  const { setupStep, setSetupStep, setHasCompletedSetup } = useSession();
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
      const next = getNextSetupStep(step);
      // The last step has nothing after it. Finish setup rather than indexing
      // off the end of setupInfo — that threw and left users stuck on step 4.
      if (!next) {
        setHasCompletedSetup(true);
        router.replace("/(app)/(home)");
        return;
      }
      setSetupStep(step + 1);
      router.push(next.route);
    },
    goToPreviousStep: () => {
      const previous = getPreviousSetupStep(step);
      // Already on the first step — nowhere to go back to.
      if (!previous) return;
      setSetupStep(step - 1);
      router.navigate(previous.route);
    },
  } as const;
};

export default useSetUpStep;

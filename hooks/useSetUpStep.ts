import { useSession } from "@/contexts/auth-context/useSession";
import { useEffect } from "react";

const useSetUpStep = (step: number) => {
  const { setupStep, setSetupStep } = useSession();

  useEffect(() => {
    if (!Number.isFinite(step)) return;
    if (setupStep === step) return;
    if (setupStep == null || setupStep < step) {
      setSetupStep(step);
    }
  }, [setSetupStep, setupStep, step]);
};

export default useSetUpStep;

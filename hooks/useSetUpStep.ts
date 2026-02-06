import { useSession } from "@/contexts/auth-context/useSession";
import { useEffect } from "react";

const useSetUpStep = (
  step: number,
  variant: "setup" | "settings" = "setup",
) => {
  const { setupStep, setSetupStep } = useSession();

  useEffect(() => {
    if (variant !== "setup") return;
    if (!Number.isFinite(step)) return;
    if (setupStep === step) return;
    if (setupStep == null || setupStep < step) {
      setSetupStep(step);
    }
  }, [setSetupStep, setupStep, step, variant]);
};

export default useSetUpStep;

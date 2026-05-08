import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";

export type BiometricSupport = {
  hasHardware: boolean;
  supportsFaceId: boolean;
  supportsFingerprint: boolean;
  isEnrolled: boolean;
  checking: boolean;
  isAvailable: boolean;
};

export function useBiometricSupport(): BiometricSupport {
  const [support, setSupport] = useState<Omit<BiometricSupport, "isAvailable">>(
    {
      hasHardware: false,
      supportsFaceId: false,
      supportsFingerprint: false,
      isEnrolled: false,
      checking: true,
    },
  );

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const [hasHardware, supportedTypes, isEnrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        if (!active) return;
        setSupport({
          hasHardware,
          supportsFaceId: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          ),
          supportsFingerprint: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT,
          ),
          isEnrolled,
          checking: false,
        });
      } catch {
        if (active) setSupport((prev) => ({ ...prev, checking: false }));
      }
    };
    check();
    return () => {
      active = false;
    };
  }, []);

  return {
    ...support,
    isAvailable: !support.checking && support.hasHardware && support.isEnrolled,
  };
}

import { clearPersistedQueryCache } from "@/lib/reactQuery";
import { setTokenRefreshFailureHandler } from "@/src/api/client";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import { UserProfile } from "@/src/api/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
} from "react";
import { useStorageState } from "./useStorageState";

/* ---------------------------------------------
   Auth Context & Types
----------------------------------------------*/
export type KycStatus = string;

export type AuthContextType = {
  // Session & Auth
  session: string | null;
  signIn: (session: string) => Promise<void>;
  signOut: () => Promise<void>;

  // User progress flags
  hasOnboarded: boolean;
  isVerified: boolean;
  kycVerificationStatus: KycStatus;
  hasSetAffirmations: boolean;
  hasCompletedSetup: boolean;
  setupStep: number | null;
  userData: UserProfile | null;
  isAuthenticated: boolean;

  // Setters
  setHasOnboarded: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  setKycVerificationStatus: (value: KycStatus) => void;
  setHasSetAffirmations: (value: boolean) => void;
  setHasCompletedSetup: (value: boolean) => void;
  setSetupStep: (value: number | null) => void;
  setUserData: (value: unknown | null) => void;

  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------------------------------------
   SessionProvider
----------------------------------------------*/
export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [[isLoadingSession, session], setSession] = useStorageState("session");
  const [[isLoadingOnboarded, hasOnboarded], setHasOnboarded] =
    useStorageState("hasOnboarded");
  const [[isLoadingVerified, isVerified], setIsVerified] =
    useStorageState("isVerified");
  const [[isLoadingAffirmations, hasSetAffirmations], setHasSetAffirmations] =
    useStorageState("hasSetAffirmations");
  const [[isLoadingUserData, userData], setUserDataRaw] =
    useStorageState("userData");
  const [
    [isLoadingCompletedSetup, hasCompletedSetupRaw],
    setHasCompletedSetupRaw,
  ] = useStorageState("hasCompletedSetup");
  const [[isLoadingSetupStep, setupStep], setSetupStepRaw] =
    useStorageState("setupStep");
  const [
    [isLoadingKycStatus, kycVerificationStatusRaw],
    setKycVerificationStatusRaw,
  ] = useStorageState("kycVerificationStatus");

  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetUserProfileQuery({
    enabled: Boolean(session),
  });

  const isLoading =
    isLoadingSession ||
    isLoadingOnboarded ||
    isLoadingVerified ||
    isLoadingAffirmations ||
    isLoadingCompletedSetup ||
    isLoadingSetupStep ||
    isLoadingKycStatus ||
    isLoadingUserData ||
    (session ? isProfileLoading && !isProfileError : false);

  /* ---------------------------------------------
     Authentication methods
  ----------------------------------------------*/

  const signIn = async (session: string) => setSession(session);

  const signOut = useCallback(async () => {
    await clearPersistedQueryCache();

    queryClient.removeQueries();
    queryClient.clear();

    setSession(null);
    setIsVerified(null);
    setKycVerificationStatusRaw(null);
    setHasSetAffirmations(null);
    setUserDataRaw(null);
    setHasCompletedSetupRaw(null);
    setSetupStepRaw(null);
  }, [
    queryClient,
    setSession,
    setIsVerified,
    setKycVerificationStatusRaw,
    setHasSetAffirmations,
    setUserDataRaw,
    setHasCompletedSetupRaw,
    setSetupStepRaw,
  ]);

  useEffect(() => {
    setTokenRefreshFailureHandler(() => {
      signOut();
    });

    return () => {
      setTokenRefreshFailureHandler(() => {});
    };
  }, [signOut]);

  /* ---------------------------------------------
     userData handling
  ----------------------------------------------*/
  const setUserData = useCallback(
    (data: unknown | null) => {
      if (data === null) {
        setUserDataRaw(null);
      } else {
        setUserDataRaw(JSON.stringify(data));
      }
    },
    [setUserDataRaw],
  );

  useEffect(() => {
    if (profileResponse?.data) {
      setUserData(profileResponse.data);
    }
  }, [profileResponse, setUserData]);

  let parsedUserData: UserProfile | null = null;
  if (typeof userData === "string") {
    try {
      const parsed = JSON.parse(userData);
      parsedUserData = parsed as UserProfile;
    } catch {
      parsedUserData = null;
    }
  }

  const hasCompletedSetup = hasCompletedSetupRaw === "true";
  let normalizedSetupStep: number | null = null;
  if (typeof setupStep === "string") {
    const parsed = Number.parseInt(setupStep, 10);
    normalizedSetupStep = Number.isNaN(parsed) ? null : parsed;
  }

  const needsBiometricSetup = Boolean(
    parsedUserData &&
      (parsedUserData.hasPin !== true ||
        parsedUserData.biometricEnabled !== true),
  );


  const kycVerificationStatus: KycStatus =
    kycVerificationStatusRaw ?? "unverified";

  // Sync kycVerificationStatus from profile response
  useEffect(() => {
    if (profileResponse?.data?.KycStatus) {
      setKycVerificationStatusRaw(profileResponse.data.KycStatus);
    }
  }, [profileResponse, setKycVerificationStatusRaw]);

  /* ---------------------------------------------
     Context value
  ----------------------------------------------*/
  const value: AuthContextType = {
    session,
    signIn,
    signOut,

    hasOnboarded: hasOnboarded === "true",
    isVerified: isVerified === "true",
    kycVerificationStatus,
    hasSetAffirmations: hasSetAffirmations === "true",
    hasCompletedSetup: hasCompletedSetup && !needsBiometricSetup,
    setupStep: needsBiometricSetup ? 5 : normalizedSetupStep,
    userData: parsedUserData,
    isAuthenticated: !!session,

    setHasOnboarded: (v) => setHasOnboarded(String(v)),
    setIsVerified: (v) => setIsVerified(String(v)),
    setKycVerificationStatus: (v) => setKycVerificationStatusRaw(v),
    setHasSetAffirmations: (v) => setHasSetAffirmations(String(v)),
    setHasCompletedSetup: (v) => setHasCompletedSetupRaw(String(v)),
    setSetupStep: (v) =>
      setSetupStepRaw(v == null || !Number.isFinite(v) ? null : String(v)),
    setUserData,

    isLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

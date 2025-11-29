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
import { clearPersistedQueryCache } from "@/lib/reactQuery";

/* ---------------------------------------------
   Auth Context & Types
----------------------------------------------*/
export type AuthContextType = {
  // Session & Auth
  session: string | null;
  signIn: (session: string) => void;
  signOut: () => void;

  // User progress flags
  hasOnboarded: boolean;
  isVerified: boolean;
  hasSetAffirmations: boolean;
  hasCompletedSetup: boolean;
  setupStep: number | null;
  userData: UserProfile | null;
  isAuthenticated: boolean;

  // Setters
  setHasOnboarded: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  setHasSetAffirmations: (value: boolean) => void;
  setHasCompletedSetup: (value: boolean) => void;
  setSetupStep: (value: number | null) => void;
  setUserData: (value: unknown | null) => void;

  // Loading
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
    isLoadingUserData ||
    (session ? isProfileLoading && !isProfileError : false);

  /* ---------------------------------------------
     Authentication methods
  ----------------------------------------------*/
  const signIn = (session: string) => setSession(session);

  const signOut = useCallback(() => {
    // Clear all React Query cache to prevent showing previous user's data
    queryClient.clear();
    void clearPersistedQueryCache();

    // Clear session and user data
    setSession(null);
    // setHasOnboarded(null);
    setIsVerified(null);
    setHasSetAffirmations(null);
    setUserDataRaw(null);
    setHasCompletedSetupRaw(null);
    setSetupStepRaw(null);
  }, [
    queryClient,
    setSession,
    setIsVerified,
    setHasSetAffirmations,
    setUserDataRaw,
    setHasCompletedSetupRaw,
    setSetupStepRaw,
  ]);

  // Set up token refresh failure handler
  useEffect(() => {
    setTokenRefreshFailureHandler(() => {
      signOut();
    });

    // Cleanup on unmount
    return () => {
      setTokenRefreshFailureHandler(() => {});
    };
  }, [signOut]);

  /* ---------------------------------------------
     userData handling
  ----------------------------------------------*/
  // SecureStore only saves strings — so we’ll stringify JSON data before saving
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

  // Parse the stored JSON (if any)
  let parsedUserData: UserProfile | null = null;
  if (typeof userData === "string") {
    try {
      const parsed = JSON.parse(userData);
      // Validate that parsed data matches UserProfile structure
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

  /* ---------------------------------------------
     Context value
  ----------------------------------------------*/
  const value: AuthContextType = {
    session,
    signIn,
    signOut,

    hasOnboarded: hasOnboarded === "true",
    isVerified: isVerified === "true",
    hasSetAffirmations: hasSetAffirmations === "true",
    hasCompletedSetup,
    setupStep: normalizedSetupStep,
    userData: parsedUserData,
    isAuthenticated: !!session,

    setHasOnboarded: (v) => setHasOnboarded(String(v)),
    setIsVerified: (v) => setIsVerified(String(v)),
    setHasSetAffirmations: (v) => setHasSetAffirmations(String(v)),
    setHasCompletedSetup: (v) => setHasCompletedSetupRaw(String(v)),
    setSetupStep: (v) =>
      setSetupStepRaw(v == null || !Number.isFinite(v) ? null : String(v)),
    setUserData,

    isLoading,
  };
  console.log(session);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { LAST_LOGIN_EMAIL_KEY } from "@/constants/auth";
import {
  asyncStorageGetItem,
  asyncStorageSetItem,
  clearAuthTokens,
} from "@/lib/persistedStorageConfig";
import { clearPin } from "@/lib/pinStorage";
import { clearPersistedQueryCache } from "@/lib/reactQuery";
import { setTokenRefreshFailureHandler } from "@/src/api/client";
import { UserProfile } from "@/src/api/types";
import { useQueryClient } from "@tanstack/react-query";
import * as Application from "expo-application";
import { router } from "expo-router";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { useAsyncStorageState, useStorageState } from "./useStorageState";

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
  hasCompletedSetup: boolean;
  setupStep: number | null;
  userData: UserProfile | null;
  isAuthenticated: boolean;

  // Setters
  setHasOnboarded: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  setKycVerificationStatus: (value: KycStatus) => void;
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
    useAsyncStorageState("hasOnboarded");
  const [[isLoadingVerified, isVerified], setIsVerified] =
    useAsyncStorageState("isVerified");
  const [[isLoadingUserData, userData], setUserDataRaw] =
    useAsyncStorageState("userData");
  const [
    [isLoadingCompletedSetup, hasCompletedSetupRaw],
    setHasCompletedSetupRaw,
  ] = useAsyncStorageState("hasCompletedSetup");
  const [[isLoadingSetupStep, setupStepRaw], setSetupStepRaw] =
    useAsyncStorageState("setupStep");
  const [
    [isLoadingKycStatus, kycVerificationStatusRaw],
    setKycVerificationStatusRaw,
  ] = useAsyncStorageState("kycVerificationStatus");

  const isLoading =
    isLoadingSession ||
    isLoadingOnboarded ||
    isLoadingVerified ||
    isLoadingCompletedSetup ||
    isLoadingSetupStep ||
    isLoadingKycStatus ||
    isLoadingUserData;

  useEffect(() => {
    (async () => {
      const installId = await asyncStorageGetItem("version_number");

      if (!installId) {
        await clearAuthTokens();

        await asyncStorageSetItem(
          "version_number",
          Application.nativeApplicationVersion ?? "unknown",
        );
      }
    })();
  }, []);

  /* ---------------------------------------------
     Authentication methods
  ----------------------------------------------*/

  const signIn = async (session: string) => setSession(session);

  const signOut = useCallback(async () => {
    if (typeof userData === "string") {
      try {
        const parsed = JSON.parse(userData) as { email?: unknown };
        if (typeof parsed.email === "string" && parsed.email.trim()) {
          await asyncStorageSetItem(
            LAST_LOGIN_EMAIL_KEY,
            parsed.email.trim().toLowerCase(),
          );
        }
      } catch {}
    }

    await clearPersistedQueryCache();

    queryClient.removeQueries();
    queryClient.clear();

    await clearPin();
    await clearAuthTokens();

    setSession(null);
    setIsVerified(null);
    setKycVerificationStatusRaw(null);
    setUserDataRaw(null);
    setHasCompletedSetupRaw(null);
    setSetupStepRaw(null);
    router.replace("/(auth)/signIn");
  }, [
    queryClient,
    setSession,
    setIsVerified,
    setKycVerificationStatusRaw,
    setUserDataRaw,
    setHasCompletedSetupRaw,
    setSetupStepRaw,
    userData,
  ]);

  useEffect(() => {
    setTokenRefreshFailureHandler(() => {
      signOut();
      Alert.alert(
        "Session Expired",
        "Your session has expired. Please sign in again.",
        [{ text: "OK" }],
      );
    });

    return () => {
      setTokenRefreshFailureHandler(null);
    };
  }, [signOut]);

  /* ---------------------------------------------
     userData handling
  ----------------------------------------------*/
  const setUserData = useCallback(
    async (data: unknown | null) => {
      if (data === null) {
        setUserDataRaw(null);
      } else {
        setUserDataRaw(JSON.stringify(data));
      }
    },
    [setUserDataRaw],
  );

  let parsedUserData: UserProfile | null = null;
  if (typeof userData === "string") {
    try {
      const parsed = JSON.parse(userData);
      parsedUserData = parsed as UserProfile;
    } catch {
      parsedUserData = null;
    }
  }

  const kycVerificationStatus: KycStatus =
    kycVerificationStatusRaw ?? "unverified";

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
    hasCompletedSetup: hasCompletedSetupRaw === "true",
    userData: parsedUserData,
    isAuthenticated: !!session,
    setupStep: Number(setupStepRaw),
    setHasOnboarded: (v) => setHasOnboarded(String(v)),
    setIsVerified: (v) => setIsVerified(String(v)),
    setKycVerificationStatus: (v) => setKycVerificationStatusRaw(v),
    setHasCompletedSetup: (v) => setHasCompletedSetupRaw(String(v)),
    setSetupStep: (v) =>
      setSetupStepRaw(v == null || !Number.isFinite(v) ? null : String(v)),
    setUserData,

    isLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

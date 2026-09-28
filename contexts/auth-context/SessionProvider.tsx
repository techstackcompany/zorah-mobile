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
import { cancelAllBillReminders } from "@/lib/localNotifications";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
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
  isAuthenticated: boolean;

  // Setters
  setHasOnboarded: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  setKycVerificationStatus: (value: KycStatus) => void;
  setHasCompletedSetup: (value: boolean) => void;
  setSetupStep: (value: number | null) => void;

  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------------------------------------
   SessionProvider
----------------------------------------------*/
export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const isSigningOut = useRef(false);
  const [[isLoadingSession, session], setSession] = useStorageState("session");
  const [[isLoadingOnboarded, hasOnboarded], setHasOnboarded] =
    useAsyncStorageState("hasOnboarded");
  const [[isLoadingVerified, isVerified], setIsVerified] =
    useAsyncStorageState("isVerified");
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
    isLoadingKycStatus;

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

  const signIn = async (session: string) => {
    isSigningOut.current = false;
    setSession(session);
  };

  const signOut = useCallback(async () => {
    isSigningOut.current = true;
    const profile = queryClient.getQueryData<UserProfile>(["auth", "profile"]);
    if (profile?.email) {
      await asyncStorageSetItem(
        LAST_LOGIN_EMAIL_KEY,
        profile.email.trim().toLowerCase(),
      );
    }

    await clearPersistedQueryCache();

    queryClient.removeQueries();
    queryClient.clear();

    await clearAuthTokens();
    await clearPin();

    try {
      await cancelAllBillReminders();
    } catch (e) {
      console.log("Failed to cancel bill reminders on sign out", e);
    }

    setSession(null);
    setIsVerified(null);
    setKycVerificationStatusRaw(null);
    setHasCompletedSetupRaw(null);
    setSetupStepRaw(null);
    router.replace("/(auth)/signIn");
  }, [
    queryClient,
    setSession,
    setIsVerified,
    setKycVerificationStatusRaw,
    setHasCompletedSetupRaw,
    setSetupStepRaw,
  ]);

  useEffect(() => {
    setTokenRefreshFailureHandler(() => {
      if (isSigningOut.current) return;
      // signOut();
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
    isAuthenticated: !!session,
    setupStep: Number(setupStepRaw),
    setHasOnboarded: (v) => setHasOnboarded(String(v)),
    setIsVerified: (v) => setIsVerified(String(v)),
    setKycVerificationStatus: (v) => setKycVerificationStatusRaw(v),
    setHasCompletedSetup: (v) => setHasCompletedSetupRaw(String(v)),
    setSetupStep: (v) =>
      setSetupStepRaw(v == null || !Number.isFinite(v) ? null : String(v)),

    isLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

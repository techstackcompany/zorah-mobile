import { createContext, PropsWithChildren } from "react";
import { useStorageState } from "./useStorageState";

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
  userData:  Record<string, any> | null
  isAuthenticated: boolean;

  // Setters
  setHasOnboarded: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  setHasSetAffirmations: (value: boolean) => void;
  setUserData: (value: unknown | null) => void;

  // Loading
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------------------------------------
   SessionProvider
----------------------------------------------*/
export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoadingSession, session], setSession] = useStorageState("session");
  const [[isLoadingOnboarded, hasOnboarded], setHasOnboarded] =
    useStorageState("hasOnboarded");
  const [[isLoadingVerified, isVerified], setIsVerified] =
    useStorageState("isVerified");
  const [[isLoadingAffirmations, hasSetAffirmations], setHasSetAffirmations] =
    useStorageState("hasSetAffirmations");
  const [[isLoadingUserData, userData], setUserDataRaw] =
    useStorageState("userData");

  const isLoading =
    isLoadingSession ||
    isLoadingOnboarded ||
    isLoadingVerified ||
    isLoadingAffirmations ||
    isLoadingUserData;

  /* ---------------------------------------------
     Authentication methods
  ----------------------------------------------*/
  const signIn = (session: string) => setSession(session);

  const signOut = () => {
    setSession(null);
    // setHasOnboarded(null);
    setIsVerified(null);
    setHasSetAffirmations(null);
    setUserDataRaw(null);
  };

  /* ---------------------------------------------
     userData handling
  ----------------------------------------------*/
  // SecureStore only saves strings — so we’ll stringify JSON data before saving
  const setUserData = (data: unknown | null) => {
    if (data === null) {
      setUserDataRaw(null);
    } else {
      setUserDataRaw(JSON.stringify(data));
    }
  };

  // Parse the stored JSON (if any)
  let parsedUserData:  Record<string, any> | null = null;
  if (typeof userData === "string") {
    try {
      parsedUserData = JSON.parse(userData);
    } catch {
      parsedUserData = null;
    }
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
    userData: parsedUserData,
    isAuthenticated: !!session,

    setHasOnboarded: (v) => setHasOnboarded(String(v)),
    setIsVerified: (v) => setIsVerified(String(v)),
    setHasSetAffirmations: (v) => setHasSetAffirmations(String(v)),
    setUserData,

    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

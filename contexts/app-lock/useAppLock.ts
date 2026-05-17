import { useContext } from "react";
import { AppLockContext, AppLockContextValue } from "./AppLockContext";

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error("useAppLock must be used within AppLockProvider");
  return ctx;
}

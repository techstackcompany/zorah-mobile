import { useContext } from "react";
import { AuthContext, AuthContextType } from "./SessionProvider";

export function useSession(): AuthContextType {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}
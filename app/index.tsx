import { useSession } from "@/contexts/auth-context/useSession";
import { Redirect } from "expo-router";
import React from "react";

export default function RootIndex() {
  const { isAuthenticated, hasCompletedSetup, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  // Authenticated and setup complete → go to app
  if (isAuthenticated && hasCompletedSetup) {
    return <Redirect href="/(app)/(home)" />;
  }

  // Not authenticated or setup incomplete → go to auth
  return <Redirect href="/(auth)/welcome" />;
}

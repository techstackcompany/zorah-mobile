import { useSession } from "@/contexts/auth-context/useSession";
import { Redirect } from "expo-router";
import React from "react";

export default function RootIndex() {
  const { isAuthenticated, hasCompletedSetup, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(home)" />;
  }

  return <Redirect href="/(auth)" />;
}

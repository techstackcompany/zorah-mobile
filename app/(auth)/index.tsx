import { useSession } from "@/contexts/auth-context/useSession";
import { Redirect } from "expo-router";
import React from "react";

const Index = () => {
  const { hasOnboarded } = useSession();

  if (hasOnboarded) {
    return <Redirect href="/welcome" />;
  }
  return <Redirect href="/(auth)/onboarding" />;
};

export default Index;

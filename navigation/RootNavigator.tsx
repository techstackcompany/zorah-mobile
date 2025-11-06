import { useSession } from "@/contexts/auth-context/useSession";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function RootNavigator() {
  const {
    isAuthenticated,
    isLoading,
    hasCompletedSetup,
    setupStep,
  } = useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasCompletedSetup) return;
    const stepRoutes: Record<number, string> = {
      1: "/(auth)/setup/choose-language",
      2: "/(auth)/setup/monthly-income",
      3: "/(auth)/setup/your-banks",
      4: "/(auth)/setup/summary",
    };
    const targetRoute = stepRoutes[setupStep ?? 1] ?? stepRoutes[1];
    const currentPath = `/${segments.join("/") || ""}`.replace(/\/+$/, "") || "/";
    if (currentPath !== targetRoute) {
      router.replace(targetRoute);
    }
  }, [isAuthenticated, hasCompletedSetup, setupStep, segments, router, isLoading]);

  if (isLoading) return null;
  return (
    <>
      <Stack screenOptions={{ headerShown: false, statusBarStyle:"dark" }}>
        {/* Public/Unauthenticated */}

        {/* Fully ready → app group */}
        <Stack.Protected guard={isAuthenticated && hasCompletedSetup}>
          <Stack.Screen name="(app)" options={{ animation: "none" }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated || !hasCompletedSetup}>
          <Stack.Screen name="(auth)" options={{ animation: "none" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default RootNavigator;

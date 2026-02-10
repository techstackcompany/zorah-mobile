import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";

function RootNavigator() {
  const { isAuthenticated, isLoading, hasCompletedSetup } = useSession();

  if (isLoading) {
    return null;
  }

  // signOut()
  const canAccessAuthRoutes = !isAuthenticated || !hasCompletedSetup;
  const canAccessAppRoutes = isAuthenticated && hasCompletedSetup;
  return (
    <>
      <Stack screenOptions={{ headerShown: false, statusBarStyle: "dark" }}>
        <Stack.Protected guard={canAccessAuthRoutes}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={canAccessAppRoutes}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default RootNavigator;

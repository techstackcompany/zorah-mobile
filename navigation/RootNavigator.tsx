import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";

function RootNavigator() {
  const { isAuthenticated, isLoading, hasCompletedSetup } = useSession();

  if (isLoading) {
    return null;
  }
  return (
    <>
      <Stack screenOptions={{ headerShown: false, statusBarStyle: "dark" }}>
        <Stack.Screen name="index" options={{ animation: "none" }} />

        <Stack.Protected guard={isAuthenticated && hasCompletedSetup}>
          <Stack.Screen name="(app)" options={{ animation: "none" }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated || !hasCompletedSetup}>
          <Stack.Screen name="(auth)" options={{ animation: "none" }} />
        </Stack.Protected>
        <Stack.Screen name="(test)" options={{ animation: "none" }} />
      </Stack>
    </>
  );
}
export default RootNavigator;

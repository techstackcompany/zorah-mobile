import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

function RootNavigator() {
  const { isAuthenticated, isLoading, isVerified, signOut } = useSession();

  useEffect(() => {
    // signOut();
  }, []);

  if (isLoading) return null;
  return (
    <>
      <Stack screenOptions={{ headerShown: false, statusBarStyle:"dark" }}>
        {/* Public/Unauthenticated */}

        {/* Fully ready → app group */}
        <Stack.Protected guard={isAuthenticated && isVerified}>
          <Stack.Screen name="(app)" options={{ animation: "none" }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" options={{ animation: "none" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default RootNavigator;

import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";

function RootNavigator() {
  const { isAuthenticated, isLoading, isVerified, signOut } = useSession();

  useEffect(() => {
    // signOut();
  }, []);

  if (isLoading) return null;
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
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

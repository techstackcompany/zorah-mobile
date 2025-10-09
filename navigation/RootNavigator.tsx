import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

function RootNavigator() {
  const { isAuthenticated, isLoading, isVerified } = useSession();

  if (isLoading) return null;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Public/Unauthenticated */}
        <Stack.Screen name="(auth)" options={{ animation: "none" }} />

        {/* Fully ready → app group */}
        <Stack.Protected guard={isAuthenticated && isVerified}>
          <Stack.Screen name="(app)" options={{ animation: "none" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default RootNavigator;

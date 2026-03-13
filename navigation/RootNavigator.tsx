import { useSession } from "@/contexts/auth-context/useSession";
import { Stack } from "expo-router";

function RootNavigator() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, statusBarStyle: "dark" }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default RootNavigator;

import { SessionProvider } from "@/contexts/auth-context/SessionProvider";
import RootNavigator from "@/navigation/RootNavigator";
import FontProvider from "@/providers/FontProvider";
import toastConfig from "@/providers/ToastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import "../global.css";

export const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <FontProvider>
          <RootNavigator />
          <Toast config={toastConfig} />
        </FontProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

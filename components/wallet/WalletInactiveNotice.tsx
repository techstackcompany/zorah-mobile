import PrimaryButton from "@/components/ui/PrimaryButton";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { setupInfo } from "@/constants/setup";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";

// Step 3 of the guided setup flow is identity verification — the step that
// provisions the wallet. Entering there also picks the user up in the rest of
// the flow, because SubmitKycSetupScreen advances via useSetUpStep on success.
export const KYC_SETUP_ROUTE = setupInfo[3].route;

interface WalletInactiveNoticeProps {
  /** Why the wallet is unavailable — prefer the backend's own copy. */
  message: string;
  title?: string;
  ctaLabel?: string;
  className?: string;
}

/**
 * Shown wherever a screen needs a wallet the user does not have yet. Explains
 * the state and sends them into the onboarding flow at the KYC step.
 */
const WalletInactiveNotice = ({
  message,
  title = "Wallet not active",
  ctaLabel = "Complete Verification",
  className,
}: WalletInactiveNoticeProps) => {
  const router = useRouter();

  return (
    <View className={cn("items-center px-2 py-4", className)}>
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary_200">
        <Ionicons
          name="shield-checkmark-outline"
          size={26}
          color={COLORS.primary_400}
        />
      </View>
      <Text
        weight="semibold"
        className="mb-2 text-center text-base text-textColor"
      >
        {title}
      </Text>
      <Text className="mb-5 text-center text-sm text-textColor/70">
        {message}
      </Text>
      <View className="w-full">
        <PrimaryButton
          label={ctaLabel}
          onPress={() => router.push(KYC_SETUP_ROUTE)}
        />
      </View>
    </View>
  );
};

export default WalletInactiveNotice;

import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  RelativePathString,
  Stack,
  useFocusEffect,
  useRouter,
} from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";

type PaymentMethod = {
  id: "bank-transfer" | "bank-ussd" | "card";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    icon: "business-outline",
  },
  {
    id: "bank-ussd",
    label: "Bank USSD",
    icon: "grid-outline",
  },
  {
    id: "card",
    label: "Fund with Card",
    icon: "card-outline",
    disabled: true,
  },
];

const FundWalletScreen = () => {
  const router = useRouter();
  const [rawAmount, setRawAmount] = useState("0");

  // Reset amount whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRawAmount("0");
    }, []),
  );

  const handleNavigate = (method: PaymentMethod) => {
    if (method.disabled || method.id === "card") {
      return;
    }

    const params = { amount: rawAmount || "0" };
    const routeMap: Record<Exclude<PaymentMethod["id"], "card">, string> = {
      "bank-transfer": "/(app)/fund-wallet/bank-transfer",
      "bank-ussd": "/(app)/fund-wallet/bank-ussd",
    };

    const target = routeMap[method.id];
    if (target) {
      router.push({ pathname: target as RelativePathString, params });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Fund Wallet" }} />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View className="flex-1 px-6 pt-6">
          <Text weight="semibold" className="text-lg text-textColor">
            How much do you want to add to your wallet?
          </Text>
          <AmountInput
            value={rawAmount}
            onChangeValue={setRawAmount}
            containerClassName="mt-6"
          />

          <View className="mt-8">
            <Text weight="semibold" className="text-base text-textColor">
              Payment Method
            </Text>

            <View className="mt-4 space-y-3">
              {paymentMethods.map((method) => {
                const isDisabled = Boolean(method.disabled);
                return (
                  <Pressable
                    key={method.id}
                    onPress={() => handleNavigate(method)}
                    disabled={isDisabled}
                    className={`flex-row items-center justify-between rounded-2xl border border-transparent bg-white px-4 py-4 ${isDisabled ? "opacity-50" : "border-grayLight/60"}`}
                    accessibilityRole="button"
                  >
                    <View className="flex-row items-center">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-lightMuted">
                        <Ionicons
                          name={method.icon}
                          size={22}
                          color={isDisabled ? "#A0A8B2" : COLORS.primary_400}
                        />
                      </View>
                      <Text
                        weight="semibold"
                        className="text-base text-textColor"
                      >
                        {method.label}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isDisabled ? "#C0C6D2" : "#77808F"}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </MainContainer>
    </>
  );
};

export default FundWalletScreen;

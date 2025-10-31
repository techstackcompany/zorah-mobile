import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

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

const formatAmount = (rawValue: string) => {
  const numericValue = Number(rawValue || "0");
  return `₦${numericValue.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const sanitizeAmountInput = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, "");
  return digitsOnly.replace(/^0+(?=\d)/, "") || "0";
};

const FundWalletScreen = () => {
  const router = useRouter();
  const [rawAmount, setRawAmount] = useState("0");

  const formattedAmount = useMemo(() => formatAmount(rawAmount), [rawAmount]);

  const handleAmountChange = (value: string) => {
    setRawAmount(sanitizeAmountInput(value));
  };

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
      router.push({ pathname: target, params });
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

          <View className="mt-6">
            <Text className="text-base text-textColor/80">Amount</Text>
            <View className="mt-3 rounded-2xl border border-grayLight/80 bg-white px-4 py-5">
              <TextInput
                value={formattedAmount}
                onChangeText={handleAmountChange}
                keyboardType="number-pad"
                className="font-degular text-3xl text-textColor"
                placeholder="₦0.00"
                placeholderTextColor="#B0B7C3"
                selection={{ start: formattedAmount.length, end: formattedAmount.length }}
              />
            </View>
          </View>

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
                          color={
                            isDisabled ? "#A0A8B2" : COLORS.primary_400
                          }
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

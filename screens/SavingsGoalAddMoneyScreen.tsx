import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  PAYMENT_SOURCES,
  SAVINGS_GOALS,
  calculateGoalProgress,
} from "@/constants/savings";
import { formatCurrency } from "@/constants/investments";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const SavingsGoalAddMoneyScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [amount, setAmount] = useState("");
  const [selectedSource, setSelectedSource] = useState(PAYMENT_SOURCES[0].id);
  const [showSuccess, setShowSuccess] = useState(false);

  const goal = useMemo(() => {
    return (
      SAVINGS_GOALS.find((item) => item.id === id) ?? SAVINGS_GOALS[0]
    );
  }, [id]);

  const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.back();
    }, 1500);
  };

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View className="flex-1">
          {showSuccess ? (
            <View className="bg-[#DFF5E5] px-6 py-4">
              <Text weight="semibold" className="text-sm text-textColor">
                Deposit recorded successfully
              </Text>
            </View>
          ) : null}
          <ScrollView
            contentContainerClassName="px-6 pb-32"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mt-6 rounded-2xl border border-[#E5E9F2] bg-white p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-1 items-start">
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: goal.iconBackground }}
                  >
                    <Ionicons name={goal.icon} size={20} color={goal.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text weight="semibold" className="text-base text-textColor">
                      {goal.name}
                    </Text>
                    <Text className="mt-1 text-xs text-textColor/60">
                      {formatCurrency(goal.currentAmount)} saved •{" "}
                      {formatCurrency(remaining)} remaining
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4">
                <View className="h-2 rounded-full bg-lightMuted">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: COLORS.primary_400,
                    }}
                  />
                </View>
                <Text className="mt-2 text-xs text-textColor/60">
                  {(progress * 100).toFixed(0)}% Complete
                </Text>
              </View>
            </View>

            <View className="mt-6">
              <AmountInput value={amount} onChangeValue={setAmount} />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Payment Source</Text>
              <View className="mt-3 gap-3">
                {PAYMENT_SOURCES.map((source) => {
                  const isActive = source.id === selectedSource;
                  return (
                    <Pressable
                      key={source.id}
                      accessibilityRole="button"
                      onPress={() => setSelectedSource(source.id)}
                      className="flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4"
                      style={{
                        borderColor: isActive ? COLORS.primary_400 : "#E5E9F2",
                      }}
                    >
                      <View className="flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-lightMuted">
                          <Ionicons
                            name={source.icon}
                            size={18}
                            color="#1D2939"
                          />
                        </View>
                        <Text className="text-sm text-textColor">
                          {source.label}
                        </Text>
                      </View>
                      <Ionicons
                        name={isActive ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={isActive ? COLORS.primary_400 : "#98A2B3"}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Button
              title="Add Money"
              className="mt-8"
              onPress={handleSubmit}
              disabled={!amount}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default SavingsGoalAddMoneyScreen;

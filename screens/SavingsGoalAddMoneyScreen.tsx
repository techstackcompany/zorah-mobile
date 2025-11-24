import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  PAYMENT_SOURCES,
  calculateGoalProgress,
  mapApiGoalToUiGoal,
} from "@/constants/savings";
import { formatCurrency } from "@/constants/investments";
import {
  useContributeToSavingsMutation,
  useGetSavingsGoalQuery,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SavingsGoalAddMoneyScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [amount, setAmount] = useState("");
  const [selectedSource, setSelectedSource] = useState(PAYMENT_SOURCES[0].id);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch goal data from API
  const {
    data: goalData,
    isLoading: isGoalLoading,
    error: goalError,
  } = useGetSavingsGoalQuery(id);

  // Map API goal to UI format
  const goal = useMemo(() => {
    if (!goalData?.data) {
      return null;
    }
    return mapApiGoalToUiGoal(goalData.data);
  }, [goalData]);

  const progress = useMemo(() => {
    if (!goal) return 0;
    return calculateGoalProgress(goal.currentAmount, goal.targetAmount);
  }, [goal]);

  const remaining = useMemo(() => {
    if (!goal) return 0;
    return Math.max(goal.targetAmount - goal.currentAmount, 0);
  }, [goal]);

  const contributeMutation = useContributeToSavingsMutation({
    onSuccess: (response) => {
      console.log("=== CONTRIBUTE TO SAVINGS GOAL SUCCESS ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("Response data:", response?.data);
      console.log("========================\n");

      // Invalidate savings goals queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["savings"] });

      setShowSuccess(true);
      Toast.show({
        type: "success",
        text1: "Contribution Added",
        text2: "Your contribution has been added successfully.",
      });

      // Reset form
      setAmount("");

      // Navigate back after a short delay
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    },
    onError: (error) => {
      console.log("=== CONTRIBUTE TO SAVINGS GOAL ERROR ===");
      console.log("Error object:", error);
      console.log("Error message:", error.message);
      console.log("Error status:", error.status);
      console.log("Error data:", error.data);
      console.log("========================\n");

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add contribution. Please try again.",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Goal ID is missing. Please try again.",
      });
      return;
    }

    Keyboard.dismiss();

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid contribution amount.",
      });
      return;
    }

    const numericAmount = Number(amount);

    const payload = {
      goalId: id,
      amount: numericAmount,
    };

    console.log("=== CONTRIBUTE TO SAVINGS GOAL REQUEST ===");
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));
    console.log("Payment source:", selectedSource);
    console.log("========================\n");

    contributeMutation.mutate(payload);
  }, [id, amount, selectedSource, contributeMutation]);

  // Loading state
  if (isGoalLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-textColor/60">Loading goal...</Text>
        </View>
      </MainContainer>
    );
  }

  // Error state
  if (goalError || !goal) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View className="flex-1 items-center justify-center px-6">
          <Text weight="semibold" className="text-lg text-textColor">
            Failed to load goal
          </Text>
          <Text className="mt-2 text-center text-textColor/60">
            {goalError?.message || "Goal not found. Please try again."}
          </Text>
          <Button
            title="Go Back"
            className="mt-4"
            onPress={() => router.back()}
          />
        </View>
      </MainContainer>
    );
  }

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
              title={
                contributeMutation.isPending
                  ? "Adding Money..."
                  : "Add Money"
              }
              className="mt-8"
              onPress={handleSubmit}
              disabled={!amount || contributeMutation.isPending}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default SavingsGoalAddMoneyScreen;

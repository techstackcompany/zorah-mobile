import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import {
  useGetSavingsGoalQuery,
  useUpdateSavingsGoalMutation,
} from "@/src/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SavingsGoalEditScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch existing goal data
  const {
    data: goalData,
    isLoading: isGoalLoading,
    error: goalError,
  } = useGetSavingsGoalQuery(id);

  useEffect(() => {
    if (goalData?.data) {
      const goal = goalData.data;
      setName(goal.title || "");
      setAmount(goal.targetAmount?.toString() || "");
      setNote(goal.description || "");

      if (goal.deadline) {
        try {
          const date = new Date(goal.deadline);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(-2);
          setTargetDate(`${day}/${month}/${year}`);
        } catch {
          setTargetDate("");
        }
      }
    }
  }, [goalData]);

  const updateGoalMutation = useUpdateSavingsGoalMutation(id || "", {
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      setShowSuccess(true);
      Toast.show({
        type: "success",
        text1: "Goal Updated",
        text2: "Your savings goal has been updated successfully.",
      });

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    },
    onError: (error) => {
    

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update goal. Please try again.",
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

    // Validate required fields
    if (!name || !name.trim()) {
      Toast.show({
        type: "error",
        text1: "Goal Name Required",
        text2: "Please enter a name for your savings goal.",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid target amount.",
      });
      return;
    }

    if (!targetDate) {
      Toast.show({
        type: "error",
        text1: "Target Date Required",
        text2: "Please select a target date for your goal.",
      });
      return;
    }

    const numericAmount = Number(amount);
    let formattedDate = targetDate;
    if (targetDate.includes("/")) {
      const [day, month, yearStr] = targetDate.split("/");
      const fullYear =
        yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
      formattedDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const payload = {
      title: name.trim(), 
      targetAmount: numericAmount,
      deadline: formattedDate,
      description: note.trim() || undefined,
    };

   

    updateGoalMutation.mutate(payload);
  }, [id, name, amount, targetDate, note, updateGoalMutation]);

  const isSubmitDisabled =
    !name ||
    !amount ||
    !targetDate ||
    updateGoalMutation.isPending ||
    isGoalLoading;

  // Loading state
  if (isGoalLoading) {
    return (
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5D5FFE" />
          <Text className="mt-4 text-textColor/60">Loading goal...</Text>
        </View>
      </MainContainer>
    );
  }

  // Error state
  if (goalError || !goalData?.data) {
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
                Goal updated successfully
              </Text>
            </View>
          ) : null}

          <ScrollView
            contentContainerClassName="px-6 pb-32"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mt-6">
              <Text className="text-sm text-textColor">Goal name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter goal name"
                placeholderTextColor="#9AA5B1"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "name"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              />
            </View>

            <View className="mt-6">
              <AmountInput
                label="Target Amount"
                value={amount}
                labelCLassName="text-textColor"
                onChangeValue={setAmount}
                onFocus={() => setFocusedField("amount")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor">Goal Category</Text>
              <CategorySelector
                categories={[]}
                selectedKey={category}
                onSelect={setCategory}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor">Target Date</Text>
              <DatePickerField
                value={targetDate}
                onChange={(date) => setTargetDate(date)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "date" : null)
                }
                isFocused={focusedField === "date"}
                renderSelectIcon={() => (
                  <Image
                    source={require("@/assets/icons/calendar.svg")}
                    style={{ width: 20, height: 20 }}
                  />
                )}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor">Note (Optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add note..."
                placeholderTextColor="#9AA5B1"
                multiline
                numberOfLines={4}
                onFocus={() => setFocusedField("note")}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "note"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
                style={{ textAlignVertical: "top", minHeight: 120 }}
              />
            </View>

            <Button
              title={
                updateGoalMutation.isPending
                  ? "Updating Goal..."
                  : "Update Goal"
              }
              className="mt-10"
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default SavingsGoalEditScreen;

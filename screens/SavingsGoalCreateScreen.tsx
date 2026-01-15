import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import { cn } from "@/lib/utils";
import {
  useCreateSavingsGoalMutation,
  useGetCategoriesQuery,
} from "@/src/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SavingsGoalCreateScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const { keyboardHeight } = useKeyboardHeight();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeOutId = useRef<number | null>(null);

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery("savings");

  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData;
  }, [categoriesData]);

  const createGoalMutation = useCreateSavingsGoalMutation({
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });

      setShowSuccess(true);
      Toast.show({
        type: "success",
        text1: "Goal Created",
        text2: "Your savings goal has been created successfully.",
      });

      setName("");
      setAmount("");
      setTargetDate("");
      setNote("");

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create goal. Please try again.",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();

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

    createGoalMutation.mutate(payload);
  }, [name, amount, targetDate, note, createGoalMutation]);

  const isSubmitDisabled =
    !name || !amount || !targetDate || createGoalMutation.isPending;

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
                Goal created successfully
              </Text>
            </View>
          ) : null}

          <ScrollView
            ref={scrollViewRef}
            contentContainerClassName="px-6"
            contentContainerStyle={{
              paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 128,
            }}
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
                categories={categories}
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
                onFocus={() => {
                  setFocusedField("note");
                  if (timeOutId.current) clearTimeout(timeOutId.current);
                  timeOutId.current = setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
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
                createGoalMutation.isPending
                  ? "Creating Goal..."
                  : "Create Goal"
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

export default SavingsGoalCreateScreen;

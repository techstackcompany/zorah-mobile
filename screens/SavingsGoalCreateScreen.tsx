import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import { cn, extractArrayResData } from "@/lib/utils";
import {
  useCreateSavingsGoalMutation,
  useGetCategoriesQuery,
  useGetSavingsGoalsQuery,
} from "@/src/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
  const [customCategory, setCustomCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const timeOutId = useRef<number | null>(null);

  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery("savings");

  const { data: goalsData } = useGetSavingsGoalsQuery();
  const existingGoals = extractArrayResData(goalsData);

  const categories = useMemo(() => {
    const apiCategories = !categoriesData ? [] : categoriesData;
    return [
      ...apiCategories,
      {
        key: "other",
        label: "Other",
        icon: require("@/assets/icons/more-ellipsis.svg"),
      },
    ];
  }, [categoriesData]);

  const createGoalMutation = useCreateSavingsGoalMutation({
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });

      Toast.show({
        type: "success",
        text1: "Goal Created",
        text2: "Your savings goal has been created successfully.",
        onHide: () => {
          router.back();
        },
      });

      setName("");
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setTargetDate("");
      setNote("");

      setTimeout(() => {}, 1500);
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

    const isDuplicate = existingGoals.some(
      (g) => g.title.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (isDuplicate) {
      setDuplicateModalVisible(true);
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

    if (!category) {
      Toast.show({
        type: "error",
        text1: "Category Required",
        text2: "Please select a category.",
      });
      return;
    }

    if (category.toLowerCase() === "other" && !customCategory.trim()) {
      Toast.show({
        type: "error",
        text1: "Custom Category Required",
        text2: "Please enter a custom category name.",
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

    const finalCategory =
      category.toLowerCase() === "other" ? customCategory.trim() : category;

    const payload = {
      title: name.trim(),
      targetAmount: numericAmount,
      deadline: formattedDate,
      category: finalCategory,
      description: note.trim() || undefined,
    };

    createGoalMutation.mutate(payload);
  }, [
    name,
    amount,
    targetDate,
    note,
    createGoalMutation,
    category,
    customCategory,
    existingGoals,
  ]);

  const isSubmitDisabled =
    !name ||
    !amount ||
    !category ||
    !targetDate ||
    createGoalMutation.isPending;

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View className="flex-1">
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
              <Text className="text-sm text-textColor">Goal Category</Text>
              <CategorySelector
                categories={categories}
                selectedKey={category}
                isLoading={isCategoriesLoading}
                onSelect={(key) => {
                  setCategory(key);
                  if (key.toLowerCase() === "other") {
                    setCustomCategory("");
                  } else {
                    const found = categories.find((c) => c.key === key);
                    if (found) setName(found.label);
                  }
                }}
              />
              {category.toLowerCase() === "other" && (
                <View className="mt-4">
                  <TextInput
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="Enter category name"
                    placeholderTextColor="#9AA5B1"
                    autoCapitalize="words"
                    onFocus={() => setFocusedField("customCategory")}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      "rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                      focusedField === "customCategory"
                        ? "border-primary_400"
                        : "border-gray-200",
                    )}
                  />
                </View>
              )}
            </View>

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

      <Modal
        visible={duplicateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDuplicateModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-3xl bg-white px-6 py-8">
            <Text weight="bold" className="text-center text-lg text-textColor">
              Goal Already Exists
            </Text>
            <Text className="mt-3 text-center text-sm text-gray-500">
              A savings goal named{" "}
              <Text weight="bold" className="text-textColor">
                &ldquo;{name}&rdquo;
              </Text>{" "}
              has already been created. Please update the goal name to continue.
            </Text>
            <Button
              title="Update Name"
              className="mt-6"
              onPress={() => setDuplicateModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </MainContainer>
  );
};

export default SavingsGoalCreateScreen;

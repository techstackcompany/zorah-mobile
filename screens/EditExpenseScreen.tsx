import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import {
  useGetCategoriesQuery,
  useGetExpenseQuery,
  useUpdateExpenseMutation,
} from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { ImageSource } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type ExpenseCategory = {
  key: string;
  label: string;
  icon: ImageSource | string;
};

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Debit Card",
  "Credit Card",
  "Mobile Money",
  "Cash",
];

// Helper function to format date from API (YYYY-MM-DD) to UI format (DD/MM/YYYY)
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
};

const EditExpenseScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const expenseId = params.id;

  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  // Fetch expense data
  const {
    data: expenseData,
    isLoading: isExpenseLoading,
    error: expenseError,
  } = useGetExpenseQuery(expenseId, {
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load expense details.",
      });
    },
  });

  // Fetch categories from API
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery("expense");

  // Extract expense from response
  const expense = useMemo(() => {
    if (!expenseData) return null;
    return Array.isArray(expenseData)
      ? expenseData[0]
      : expenseData.data || expenseData;
  }, [expenseData]);

  // Map API categories to UI format
  const expenseCategories = useMemo<ExpenseCategory[]>(() => {
    if (!categoriesData?.data?.subcategories) {
      return [];
    }

    return categoriesData.data.subcategories.map((subcategory) => ({
      key: subcategory.name,
      label: subcategory.name,
      icon: subcategory.image || "",
    }));
  }, [categoriesData]);

  // Pre-populate form fields when expense data loads
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount?.toString() || "");
      setSelectedCategory(expense.category || "");
      setPaymentMethod(expense.paymentMethod || "");
      setDate(formatDateForInput(expense.date));
      setDescription(expense.description || "");
    }
  }, [expense]);

  // Set default selected category when categories are loaded and no category is set
  useEffect(() => {
    if (expenseCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(expenseCategories[0].key);
    }
  }, [expenseCategories, selectedCategory]);

  const updateExpenseMutation = useUpdateExpenseMutation(expenseId, {
    onSuccess: () => {
      // Invalidate expense queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", "detail", expenseId] });

      Toast.show({
        type: "success",
        text1: "Expense Updated",
        text2: "Your expense has been updated successfully.",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update expense. Please try again.",
      });
    },
  });

  const openPaymentModal = useCallback(() => {
    setIsPaymentModalVisible(true);
    setFocusedField("payment");
  }, []);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalVisible(false);
    setFocusedField(null);
  }, []);

  const handleSelectPaymentMethod = useCallback((method: string) => {
    setPaymentMethod(method);
    setIsPaymentModalVisible(false);
    setFocusedField(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!amount || Number(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid expense amount.",
      });
      return;
    }

    if (!date) {
      Toast.show({
        type: "error",
        text1: "Date Required",
        text2: "Please select a date for this expense.",
      });
      return;
    }

    if (!paymentMethod) {
      Toast.show({
        type: "error",
        text1: "Payment Method Required",
        text2: "Please select a payment method.",
      });
      return;
    }

    if (!selectedCategory) {
      Toast.show({
        type: "error",
        text1: "Category Required",
        text2: "Please select a category.",
      });
      return;
    }

    const numericAmount = Number(amount);

    let formattedDate = date;
    if (date.includes("/")) {
      const [day, month, yearStr] = date.split("/");
      const fullYear =
        yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
      formattedDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const payload = {
      amount: numericAmount,
      category: selectedCategory,
      description: description || undefined,
      paymentMethod,
      date: formattedDate,
    };

    updateExpenseMutation.mutate(payload);
  }, [
    amount,
    selectedCategory,
    paymentMethod,
    date,
    description,
    updateExpenseMutation,
  ]);

  // Show loading state while fetching expense
  if (isExpenseLoading) {
    return (
      <MainContainer className="bg-light" edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary_400} />
          <Text className="mt-4 text-sm text-textColor/60">
            Loading expense details...
          </Text>
        </View>
      </MainContainer>
    );
  }

  // Show error state if expense fetch fails
  if (expenseError || !expense) {
    return (
      <MainContainer className="bg-light" edges={[]}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.textColor}
            style={{ opacity: 0.4 }}
          />
          <Text weight="semibold" className="mt-4 text-base text-textColor">
            Expense Not Found
          </Text>
          <Text className="mt-2 text-center text-sm text-textColor/60">
            {expenseError?.message ||
              "The expense you're looking for doesn't exist."}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-lg bg-primary_400 px-6 py-3"
            accessibilityRole="button"
          >
            <Text weight="semibold" className="text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </MainContainer>
    );
  }

  return (
    <MainContainer className="bg-light" edges={[]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1 px-6 pt-4"
            contentContainerClassName="pb-10"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="mt-4 gap-6">
              <AmountInput
                value={amount}
                onChangeValue={setAmount}
                onFocus={() => setFocusedField("amount")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "amount" ? null : prev))
                }
              />

              <View>
                <Text className="text-sm text-textColor/70">Category</Text>
                {isCategoriesLoading ? (
                  <View className="mt-3 items-center justify-center rounded-2xl border border-gray-200 bg-white py-8">
                    <Text className="text-textColor/50">Loading categories...</Text>
                  </View>
                ) : categoriesError ? (
                  <View className="mt-3 items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-8">
                    <Text className="text-red-600">
                      Failed to load categories. Please try again.
                    </Text>
                  </View>
                ) : expenseCategories.length > 0 ? (
                  <CategorySelector
                    categories={expenseCategories}
                    selectedKey={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                ) : (
                  <View className="mt-3 items-center justify-center rounded-2xl border border-gray-200 bg-white py-8">
                    <Text className="text-textColor/50">No categories available</Text>
                  </View>
                )}
              </View>

              <View>
                <Text className="text-sm text-textColor/70">
                  Payment method
                </Text>
                <Pressable
                  onPress={openPaymentModal}
                  className={cn(
                    "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                    focusedField === "payment"
                      ? "border-primary_400"
                      : "border-gray-200",
                  )}
                >
                  <Text
                    className={cn(
                      "text-base",
                      paymentMethod ? "text-textColor" : "text-textColor/50",
                    )}
                  >
                    {paymentMethod || "Select payment method"}
                  </Text>

                  <Ionicons
                    name={isPaymentModalVisible ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.textColor}
                  />
                </Pressable>
              </View>

              <View>
                <Text className="text-sm text-textColor/70">Date</Text>
                <DatePickerField
                  value={date}
                  onChange={(formatted, _raw) => {
                    setDate(formatted);
                  }}
                  isFocused={focusedField === "date"}
                  onFocusChange={(focused) =>
                    setFocusedField(focused ? "date" : null)
                  }
                />
              </View>

              <View>
                <TextInputField
                  label="Description (Optional)"
                  placeholder="What did you spend the money on? (e.g., Lunch at Mama Cass)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onFocusChange={(focused) =>
                    setFocusedField(focused ? "description" : null)
                  }
                  inputClassName="min-h-[120px]"
                />
              </View>
            </View>
          </ScrollView>
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleSubmit}
              disabled={updateExpenseMutation.isPending}
              className={cn(
                "items-center justify-center rounded-2xl py-4",
                updateExpenseMutation.isPending
                  ? "bg-primary_400/60"
                  : "bg-primary_400",
              )}
            >
              <Text weight="semibold" className="text-base text-white">
                {updateExpenseMutation.isPending
                  ? "Updating Expense..."
                  : "Update Expense"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      <SlideUpModal
        visible={isPaymentModalVisible}
        onClose={closePaymentModal}
        title="Payment Method"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#fff"
        closeIconColor="#fff"
        className="px-0"
      >
        <View className="gap-2">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method;
            return (
              <Pressable
                key={method}
                onPress={() => handleSelectPaymentMethod(method)}
                className={cn(
                  "rounded-2xl px-4 py-3",
                  isSelected ? "bg-primary_100" : "bg-white",
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    weight="semibold"
                    className={cn(
                      "text-base text-textColor",
                      isSelected && "text-primary_400",
                    )}
                  >
                    {method}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.primary_400}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

export default EditExpenseScreen;

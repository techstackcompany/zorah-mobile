import MainContainer from "@/components/layouts/MainContainer";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import AmountInput from "@/components/ui/AmountInput";
import CategorySelector from "@/components/ui/CategorySelector";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useAddIncomeMutation, useGetCategoriesQuery } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { ImageSource } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type IncomeCategory = {
  key: string;
  label: string;
  icon: ImageSource | string;
};

const PAYMENT_METHODS = ["Cash", "Card", "Transfer", "Wallet"];

const AddIncomeScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery("income");

  // Map API categories to UI format
  const incomeCategories = useMemo<IncomeCategory[]>(() => {
    if (!categoriesData) {
      return [];
    }

    return categoriesData.map((subcategory) => ({
      key: subcategory.name,
      label: subcategory.name,
      icon: subcategory.image || "", 
    }));
  }, [categoriesData]);

  // Set default selected category when categories are loaded
  useEffect(() => {
    if (incomeCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(incomeCategories[0].key);
    }
  }, [incomeCategories, selectedCategory]);

  const addIncomeMutation = useAddIncomeMutation({
    onSuccess: (response) => {
      console.log("=== ADD INCOME SUCCESS ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("Response data:", response?.data);
      console.log("========================\n");

      // Invalidate income queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["income"] });

      Toast.show({
        type: "success",
        text1: "Income Added",
        text2: "Your income has been recorded successfully.",
      });

      // Reset form
      setAmount("");
      setPaymentMethod("");
      setDate("");
      setDescription("");

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error) => {
      console.log("=== ADD INCOME ERROR ===");
      console.log("Error object:", error);
      console.log("Error message:", error.message);
      console.log("Error status:", error.status);
      console.log("Error data:", error.data);
      console.log("========================\n");

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add income. Please try again.",
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
    // Validate required fields
    if (!amount || Number(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid income amount.",
      });
      return;
    }

    if (!date) {
      Toast.show({
        type: "error",
        text1: "Date Required",
        text2: "Please select a date for this income.",
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

    // Format date to YYYY-MM-DD
    // DatePickerField returns DD/MM/YY format
    let formattedDate = date;
    if (date.includes("/")) {
      const [day, month, yearStr] = date.split("/");
      // Handle 2-digit year (YY) - assume 20XX for years 00-99
      const fullYear =
        yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
      formattedDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const payload = {
      source: paymentMethod, // Payment method maps to "source" in API
      amount: numericAmount,
      category: selectedCategory.toLowerCase(), // API expects lowercase category
      description: description.trim() || undefined,
      date: formattedDate,
    };

    console.log("=== ADD INCOME REQUEST ===");
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));
    console.log("Original form values:", {
      amount,
      selectedCategory,
      paymentMethod,
      date,
      description,
    });
    console.log("Formatted date:", formattedDate);
    console.log("========================\n");

    addIncomeMutation.mutate(payload);
  }, [
    amount,
    selectedCategory,
    paymentMethod,
    date,
    description,
    addIncomeMutation,
  ]);

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
                ) : incomeCategories.length > 0 ? (
                  <CategorySelector
                    categories={incomeCategories}
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
                  onChange={(formatted) => {
                    setDate(formatted);
                  }}
                  isFocused={focusedField === "date"}
                  onFocusChange={(focused) =>
                    setFocusedField(focused ? "date" : null)
                  }
                />
              </View>

              <View>
                <Text className="text-sm text-textColor/70">
                  Description (Optional)
                </Text>
                <TextInput
                  placeholder="What did you receive the money for? (e.g., Salary for September)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "mt-2 min-h-[120px] rounded-2xl border bg-white px-4 py-4 text-base font-nunitoMedium",
                    focusedField === "description"
                      ? "border-primary_400"
                      : "border-gray-200",
                  )}
                />
              </View>
            </View>
          </ScrollView>
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleSubmit}
              disabled={addIncomeMutation.isPending}
              className={cn(
                "items-center justify-center rounded-2xl py-4",
                addIncomeMutation.isPending
                  ? "bg-primary_400/60"
                  : "bg-primary_400",
              )}
            >
              <Text weight="semibold" className="text-base text-white">
                {addIncomeMutation.isPending
                  ? "Adding Income..."
                  : "Add New Income"}
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

export default AddIncomeScreen;

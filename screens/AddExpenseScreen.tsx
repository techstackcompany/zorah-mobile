import PaymentModal from "@/components/expense-planning/PaymentModal";
import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SelectButton from "@/components/ui/SelectButton";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import { addKeyboardBehavior, getErrorMessage } from "@/lib/utils";
import { useAddExpenseMutation, useGetCategoriesQuery } from "@/src/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

type ExpenseCategory = {
  key: string;
  label: string;
  icon: ImageSource | string;
};

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "transfer" },
  { label: "Card", value: "card" },
  { label: "Wallet", value: "wallet" },
  { label: "Cash", value: "cash" },
];

type ValidateFieldsParams = {
  amount: string;
  date: string;
  paymentMethod: string;
  selectedCategory: string;
};

const validateFields = ({
  amount,
  date,
  paymentMethod,
  selectedCategory,
}: ValidateFieldsParams): boolean => {
  if (!amount || Number(amount) <= 0) {
    Toast.show({
      type: "error",
      text1: "Invalid Amount",
      text2: "Please enter a valid expense amount.",
    });
    return false;
  }

  if (!date) {
    Toast.show({
      type: "error",
      text1: "Date Required",
      text2: "Please select a date for this expense.",
    });
    return false;
  }

  if (!paymentMethod) {
    Toast.show({
      type: "error",
      text1: "Payment Method Required",
      text2: "Please select a payment method.",
    });
    return false;
  }

  if (!selectedCategory) {
    Toast.show({
      type: "error",
      text1: "Category Required",
      text2: "Please select a category.",
    });
    return false;
  }
  return true;
};

const usePaymentMethodActions = (
  setFocusedField: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const openPaymentModal = useCallback(() => {
    setIsPaymentModalVisible(true);
    setFocusedField("payment");
  }, [setFocusedField]);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalVisible(false);
    setFocusedField(null);
  }, [setFocusedField]);

  const handleSelectPaymentMethod = useCallback(
    (method: string) => {
      setPaymentMethod(method);
      setIsPaymentModalVisible(false);
      setFocusedField(null);
    },
    [setFocusedField],
  );

  return {
    isPaymentModalVisible,
    paymentMethod,
    setPaymentMethod,
    openPaymentModal,
    closePaymentModal,
    handleSelectPaymentMethod,
  };
};

const useExpenseSubCategories = () => {
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery("expense");

  const expenseCategories = useMemo<ExpenseCategory[]>(() => {
    if (!categoriesData?.data?.subcategories) {
      return [];
    }

    return categoriesData.data.subcategories.map(({ name, image }) => ({
      key: name,
      label: name,
      icon: image || "",
    }));
  }, [categoriesData]);

  return { expenseCategories, isCategoriesLoading, categoriesError };
};

const AddExpenseScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const {
    isPaymentModalVisible,
    paymentMethod,
    setPaymentMethod,
    openPaymentModal,
    closePaymentModal,
    handleSelectPaymentMethod,
  } = usePaymentMethodActions(setFocusedField);

  const { expenseCategories, isCategoriesLoading, categoriesError } =
    useExpenseSubCategories();

  useEffect(() => {
    if (expenseCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(expenseCategories[0].key);
    }
  }, [expenseCategories, selectedCategory]);

  const addExpenseMutation = useAddExpenseMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      Toast.show({
        type: "success",
        text1: "Expense Added",
        text2: "Your expense has been recorded successfully.",
      });
      setAmount("");
      setPaymentMethod("");
      setDate("");
      setDescription("");
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error) => {
      console.log('error', error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getErrorMessage(
          error,
          "Failed to add expense. Please try again.",
        ),
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (validateFields({ amount, date, paymentMethod, selectedCategory })) {
      const numericAmount = Number(amount);
      const apiCategory = selectedCategory;

      let formattedDate = date;
      const [day, month, yearStr] = date.split("/");
      const fullYear =
        yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
      formattedDate = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

      const payload = {
        amount: numericAmount,
        category: apiCategory,
        description: description || undefined,
        paymentMethod,
        date: formattedDate,
      };

      addExpenseMutation.mutate(payload);
    }
  }, [
    amount,
    selectedCategory,
    paymentMethod,
    date,
    description,
    addExpenseMutation,
  ]);

  return (
    <MainContainer className="bg-light" edges={[]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={addKeyboardBehavior()}
        keyboardVerticalOffset={200}
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1 px-6 pt-4"
            contentContainerClassName="pb-10"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 400 }}
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
                    <Text className="text-textColor/50">
                      Loading categories...
                    </Text>
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
                    <Text className="text-textColor/50">
                      No categories available
                    </Text>
                  </View>
                )}
              </View>

              <View>
                <Text className="mb-2 text-sm text-textColor/70">
                  Payment method
                </Text>
                <SelectButton
                  value={paymentMethod}
                  placeholder="Select payment method"
                  onPress={openPaymentModal}
                  isOpen={isPaymentModalVisible}
                  isFocused={focusedField === "payment"}
                />
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
          </ScrollView>
          <View className="px-6 pb-6">
            <PrimaryButton
              onPress={handleSubmit}
              loading={addExpenseMutation.isPending}
              label="Add New Expense"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <PaymentModal
        visible={isPaymentModalVisible}
        onClose={closePaymentModal}
        paymentMethods={PAYMENT_METHODS}
        selectedMethod={paymentMethod}
        onSelect={handleSelectPaymentMethod}
      />
    </MainContainer>
  );
};

export default AddExpenseScreen;

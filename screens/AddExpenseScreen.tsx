import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useAddExpenseMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type ExpenseCategoryKey = "transport" | "food" | "call" | "pos";

type ExpenseCategory = {
  key: ExpenseCategoryKey;
  label: string;
  icon: ImageSource;
  accent: string;
  tint: string;
};

const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  {
    key: "transport",
    label: "Transport",
    icon: require("@/assets/images/home/transport.png"),
    accent: "#8E5BE7",
    tint: "#F1E8FF",
  },
  {
    key: "food",
    label: "Food",
    icon: require("@/assets/images/home/food.png"),
    accent: "#E9781A",
    tint: "#FFE9D8",
  },
  {
    key: "call",
    label: "Call",
    icon: require("@/assets/images/home/call.png"),
    accent: "#2FA89A",
    tint: "#E6F5F3",
  },
  {
    key: "pos",
    label: "Pos \n Charges",
    icon: require("@/assets/images/home/bonus.png"),
    accent: "#1A43BE",
    tint: "#E9EEFF",
  },
] as const;

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Debit Card",
  "Credit Card",
  "Mobile Money",
  "Cash",
];

// Map UI category keys to API category values
const CATEGORY_MAP: Record<ExpenseCategoryKey, string> = {
  transport: "Transport",
  food: "Food",
  call: "Calls",
  pos: "POS Charges",
};

const AddExpenseScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategoryKey>("transport");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const addExpenseMutation = useAddExpenseMutation({
    onSuccess: (response) => {
      console.log("=== ADD EXPENSE SUCCESS ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("Response data:", response?.data);
      console.log("========================\n");

      // Invalidate expense queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      Toast.show({
        type: "success",
        text1: "Expense Added",
        text2: "Your expense has been recorded successfully.",
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
      console.log("=== ADD EXPENSE ERROR ===");
      console.log("Error object:", error);
      console.log("Error message:", error.message);
      console.log("Error status:", error.status);
      console.log("Error data:", error.data);
      console.log("========================\n");

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add expense. Please try again.",
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

    const numericAmount = Number(amount);
    const apiCategory = CATEGORY_MAP[selectedCategory];

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
      amount: numericAmount,
      category: apiCategory,
      description: description || undefined,
      paymentMethod,
      date: formattedDate,
    };

    console.log("=== ADD EXPENSE REQUEST ===");
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));
    console.log("Original form values:", {
      amount,
      selectedCategory,
      paymentMethod,
      date,
      description,
    });
    console.log("Mapped category:", apiCategory);
    console.log("Formatted date:", formattedDate);
    console.log("========================\n");

    addExpenseMutation.mutate(payload);
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
                <CategorySelector
                  categories={EXPENSE_CATEGORIES}
                  selectedKey={selectedCategory}
                  onSelect={setSelectedCategory}
                />
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
                <Text className="text-sm text-textColor/70">
                  Description (Optional)
                </Text>
                <TextInput
                  placeholder="What did you spend the money on? (e.g., Lunch at Mama Cass)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "mt-2 min-h-[120px] rounded-2xl border bg-white px-4 py-4 font-nunitoMedium text-base",
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
              disabled={addExpenseMutation.isPending}
              className={cn(
                "items-center justify-center rounded-2xl py-4",
                addExpenseMutation.isPending
                  ? "bg-primary_400/60"
                  : "bg-primary_400",
              )}
            >
              <Text weight="semibold" className="text-base text-white">
                {addExpenseMutation.isPending
                  ? "Adding Expense..."
                  : "Add New Expense"}
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

export default AddExpenseScreen;

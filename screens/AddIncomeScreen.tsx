import MainContainer from "@/components/layouts/MainContainer";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import AmountInput from "@/components/ui/AmountInput";
import CategorySelector from "@/components/ui/CategorySelector";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
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

type IncomeCategoryKey = "salary" | "investment" | "allowance" | "bonus";

type IncomeCategory = {
  key: IncomeCategoryKey;
  label: string;
  icon: ImageSource;
  accent: string;
  tint: string;
};

const INCOME_CATEGORIES: readonly IncomeCategory[] = [
  {
    key: "salary",
    label: "Salary",
    icon: require("@/assets/images/home/salary.png"),
    accent: "#1A43BE",
    tint: "#E9EEFF",
  },
  {
    key: "investment",
    label: "Investment",
    icon: require("@/assets/images/home/investment.png"),
    accent: "#2FA89A",
    tint: "#E6F5F3",
  },
  {
    key: "allowance",
    label: "Allowance",
    icon: require("@/assets/images/home/bonus.png"),
    accent: "#E9781A",
    tint: "#FFE9D8",
  },
  {
    key: "bonus",
    label: "Bonus",
    icon: require("@/assets/images/home/bonus.png"),
    accent: "#8E5BE7",
    tint: "#F1E8FF",
  },
] as const;

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Debit Card",
  "Credit Card",
  "Mobile Money",
  "Cash",
];

const AddIncomeScreen = () => {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<IncomeCategoryKey>("salary");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

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
    const numericAmount = Number(amount);
    const resolvedAmount = Number.isNaN(numericAmount)
      ? "0.00"
      : numericAmount.toFixed(2);
    console.log({
      amount: resolvedAmount,
      category: selectedCategory,
      paymentMethod,
      date,
      description,
    });
  }, [amount, selectedCategory, paymentMethod, date, description]);

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
                  categories={INCOME_CATEGORIES}
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
              className="items-center justify-center rounded-2xl bg-primary_400 py-4"
            >
              <Text weight="semibold" className="text-base text-white">
                Add New Income
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

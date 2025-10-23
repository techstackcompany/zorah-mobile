import MainContainer from "@/components/layouts/MainContainer";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

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
    icon: require("@/assets/images/home/bonus.png"),
    accent: "#1A43BE",
    tint: "#E9EEFF",
  },
  {
    key: "food",
    label: "Food",
    icon: require("@/assets/images/home/investment.png"),
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
    label: "POS Charges",
    icon: require("@/assets/images/home/salary.png"),
    accent: "#8E5BE7",
    tint: "#F1E8FF",
  },
] as const;

const PAYMENT_METHODS = ["Bank Transfer", "Cash", "Card", "POS"];

const AddExpenseScreen = () => {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategoryKey>("transport");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onChangeAmount = useCallback((value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    const normalized =
      parts.length > 1
        ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`
        : cleanValue;
    setAmount(normalized);
  }, []);

  const showPaymentPicker = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...PAYMENT_METHODS, "Cancel"],
          cancelButtonIndex: PAYMENT_METHODS.length,
          userInterfaceStyle: "light",
        },
        (buttonIndex) => {
          if (buttonIndex < PAYMENT_METHODS.length) {
            setPaymentMethod(PAYMENT_METHODS[buttonIndex]);
          }
        },
      );
    } else {
      Alert.alert("Select payment method", undefined, [
        ...PAYMENT_METHODS.map((method) => ({
          text: method,
          onPress: () => setPaymentMethod(method),
        })),
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    }
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
      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="mt-4 gap-6">
          <View
            className={cn(
              "rounded-2xl  border border-gray-200  bg-white px-4 py-4",
              focusedField === "amount"
                ? "border-primary_400"
                : "border-gray-200",
            )}
          >
            <Text className="text-sm text-textColor/70">Amount</Text>
            <View className={cn("mt-2 flex-row items-end")}>
              <Text
                weight="semibold"
                className="mr-2  text-4xl text-textColor"
              >
                ₦
              </Text>
              <TextInput
                value={amount}
                onChangeText={onChangeAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                onFocus={() => setFocusedField("amount")}
                onBlur={() => setFocusedField(null)}
                className="flex-1  py-0 font-nunitoSemibold text-4xl text-textColor"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm text-textColor/70">Category</Text>
            <View className="mt-3 flex-row flex-wrap gap-3">
              {EXPENSE_CATEGORIES.map((category) => {
                const isActive = category.key === selectedCategory;
                return (
                  <Pressable
                    key={category.key}
                    onPress={() => setSelectedCategory(category.key)}
                    className={cn(
                      "items-center gap-3 rounded-2xl border px-4 py-3",
                      isActive
                        ? "border-primary_400 bg-white"
                        : "border-gray-200 bg-white",
                    )}
                    accessibilityRole="button"
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: category.tint }}
                    >
                      <Image
                        source={category.icon}
                        style={{ width: 24, height: 24 }}
                        contentFit="contain"
                      />
                    </View>
                    <Text
                      weight="medium"
                      className={cn(
                        "text-base",
                        isActive ? "text-textColor" : "text-textColor/70",
                      )}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="text-sm text-textColor/70">Payment method</Text>
            <Pressable
              onPress={showPaymentPicker}
              className={cn(
                "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                focusedField === "payment"
                  ? "border-primary_400"
                  : "border-gray-200",
              )}
              onPressIn={() => setFocusedField("payment")}
              onPressOut={() => setFocusedField(null)}
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
                name="chevron-down"
                size={18}
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
                "mt-2 min-h-[120px] rounded-2xl border bg-white px-4 py-4 text-base",
                focusedField === "description"
                  ? "border-primary_400"
                  : "border-gray-200",
              )}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          className="mt-10 items-center justify-center rounded-2xl bg-primary_400 py-4"
        >
          <Text weight="semibold" className="text-base text-white">
            Add New Expense
          </Text>
        </Pressable>
      </ScrollView>
    </MainContainer>
  );
};

export default AddExpenseScreen;

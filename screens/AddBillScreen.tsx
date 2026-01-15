import PaymentModal, {
  PaymentModalRef,
} from "@/components/expense-planning/PaymentModal";
import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import SelectButton from "@/components/ui/SelectButton";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useGetCategoriesQuery } from "@/src/api/hooks";
import { useAddBillReminderMutation } from "@/src/api/hooks/useBillRemindersApi";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const AddBillScreen = () => {
  const router = useRouter();
  const successTimeoutRef = useRef<number | null>(null);
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const paymentModalRef = useRef<PaymentModalRef>(null);

  const { data: categories = [], isPending: isCategoriesLoading } =
    useGetCategoriesQuery("budget");
  const { mutate: addBill, isPending: isSubmitting } =
    useAddBillReminderMutation({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Bill Added",
          text2: "Your bill reminder has been added successfully.",
        });
        successTimeoutRef.current = setTimeout(() => {
          router.back();
        }, 1200);
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "Failed to add bill. Please try again.",
        });
      },
    });

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const openPaymentModal = useCallback(() => {
    paymentModalRef.current?.present();
    setFocusedField("payment");
  }, []);

  const closePaymentModal = useCallback(() => {
    paymentModalRef.current?.dismiss();
    setFocusedField(null);
  }, []);

  const handleSelectPaymentMethod = useCallback((method: string) => {
    setPaymentMethod(method);
    paymentModalRef.current?.dismiss();
    setFocusedField(null);
  }, []);

  const paymentMethods = [
    { key: "cash", label: "Cash" },
    { key: "card", label: "Card" },
    { key: "bank_transfer", label: "Bank Transfer" },
    { key: "mobile_money", label: "Mobile Money" },
  ];

  const isSubmitDisabled = useMemo(() => {
    return !billName || !amount || !dueDate || !category || !paymentMethod;
  }, [billName, amount, dueDate, category, paymentMethod]);

  const handleSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }
    Keyboard.dismiss();

    let formattedDueDate = dueDate;
    if (dueDate.includes("/")) {
      const [day, month, yearStr] = dueDate.split("/");
      const fullYear =
        yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
      const date = new Date(fullYear, Number(month) - 1, Number(day));
      formattedDueDate = date.toISOString();
    }

    addBill({
      name: billName,
      amount: parseFloat(amount),
      dueDate: formattedDueDate,
      category,
      paymentMethod,
      reminderEnabled,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Add Bill" }} />
      <MainContainer edges={[]} className="bg-lightMuted pb-0">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
        >
          <View className="flex-1">
            <ScrollView
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="px-6 pb-36"
            >
              <View className="mt-6">
                <Text className="text-sm text-textColor">Bill Name</Text>
                <TextInput
                  value={billName}
                  onChangeText={setBillName}
                  placeholder="e.g., Electricity"
                  placeholderTextColor="#A0A8B2"
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className={`mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor ${focusedField === "name" ? "border-primary_400" : "border-gray-200"}`}
                />
              </View>

              <View className="mt-6">
                <AmountInput
                  label="Amount"
                  value={amount}
                  onChangeValue={setAmount}
                  onFocus={() => setFocusedField("amount")}
                  onBlur={() => setFocusedField(null)}
                  containerClassName={
                    focusedField === "amount"
                      ? "border-primary_400"
                      : "border-gray-200"
                  }
                />
              </View>

              <View className="mt-6">
                <Text className="text-sm text-textColor">Due Date</Text>
                <DatePickerField
                  value={dueDate}
                  onChange={(formatted) => setDueDate(formatted)}
                  onFocusChange={(focused) =>
                    setFocusedField(focused ? "dueDate" : null)
                  }
                  isFocused={focusedField === "dueDate"}
                  placeholder="DD/MM/YY"
                  renderSelectIcon={() => (
                    <Image
                      source={require("@/assets/icons/calendar.svg")}
                      style={{ width: 20, height: 20 }}
                    />
                  )}
                />
              </View>

              <View className="mt-6">
                <Text className="text-sm text-textColor">Category</Text>
                <CategorySelector
                  categories={categories}
                  selectedKey={category}
                  onSelect={setCategory}
                />
              </View>

              <View className="mt-6">
                <Text className="text-sm text-textColor">Payment Method</Text>
                <SelectButton
                  value={
                    paymentMethods.find((m) => m.key === paymentMethod)?.label
                  }
                  placeholder="Select payment method"
                  onPress={openPaymentModal}
                  isSelected={!!paymentMethod}
                  isFocused={focusedField === "paymentMethod"}
                  className="mt-2"
                />
              </View>

              <View className="mt-6">
                <View className="flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4">
                  <Text className="text-base text-textColor">
                    Enable Reminder
                  </Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{
                      false: COLORS.grey,
                      true: COLORS.secondary_400,
                    }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#D7DCE5"
                  />
                </View>
              </View>

              <Button
                title={isSubmitting ? "Adding..." : "Add Bill"}
                className="mt-10"
                onPress={handleSubmit}
                disabled={isSubmitDisabled || isSubmitting}
              >
                {isSubmitting && (
                  <ActivityIndicator
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                )}
              </Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        <PaymentModal
          ref={paymentModalRef}
          onClose={closePaymentModal}
          paymentMethods={paymentMethods.map((m) => ({
            label: m.label,
            value: m.key,
          }))}
          selectedMethod={paymentMethod}
          onSelect={handleSelectPaymentMethod}
        />
      </MainContainer>
    </>
  );
};

export default AddBillScreen;

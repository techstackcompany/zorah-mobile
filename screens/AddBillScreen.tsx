import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useGetCategoriesQuery } from "@/src/api/hooks";
import { useAddBillReminderMutation } from "@/src/api/hooks/useBillRemindersApi";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const AddBillScreen = () => {
  const router = useRouter();
  const successTimeoutRef = useRef<number | null>(null);
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [note, setNote] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: categories = [], isPending: isCategoriesLoading } =
    useGetCategoriesQuery("budget");
  const { mutate: addBill, isPending: isSubmitting } =
    useAddBillReminderMutation({
      onSuccess: () => {
        setShowSuccess(true);
        successTimeoutRef.current = setTimeout(() => {
          setShowSuccess(false);
          router.back();
        }, 1200);
      },
      onError: (error) => {
        console.error("Failed to add bill:", error);
      },
    });

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
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
    addBill({
      name: billName,
      amount: parseFloat(amount),
      dueDate,
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
            {showSuccess ? (
              <View
                className="bg-[#DFF5E5] px-6 py-4"
                style={{
                  borderBottomColor: COLORS.secondary_500,
                  borderBottomWidth: 1,
                }}
              >
                <Text weight="semibold" className="text-sm text-textColor">
                  Bill added successfully
                </Text>
              </View>
            ) : null}
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
                <SelectInput
                  value={category}
                  onValueChange={setCategory}
                  items={categories}
                  placeholder="Select category"
                  onFocusChange={(focused) =>
                    setFocusedField(focused ? "category" : null)
                  }
                  isFocused={focusedField === "category"}
                  disabled={isCategoriesLoading}
                />
              </View>

              <View className="mt-6">
                <Text className="text-sm text-textColor">Payment Method</Text>
                <SelectInput
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  items={paymentMethods}
                  placeholder="Select payment method"
                  onFocusChange={(focused) =>
                    setFocusedField(focused ? "paymentMethod" : null)
                  }
                  isFocused={focusedField === "paymentMethod"}
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

              <View className="mt-6">
                <Text className="text-sm text-textColor">Note (Optional)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Message..."
                  placeholderTextColor="#A0A8B2"
                  multiline
                  onFocus={() => setFocusedField("note")}
                  onBlur={() => setFocusedField(null)}
                  className={`mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor ${focusedField === "note" ? "border-primary_400" : "border-gray-200"}`}
                  style={{ minHeight: 120, textAlignVertical: "top" }}
                />
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
      </MainContainer>
    </>
  );
};

export default AddBillScreen;

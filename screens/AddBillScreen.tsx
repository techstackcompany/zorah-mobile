import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import SelectField from "@/components/setup/SelectField";
import COLORS from "@/constants/colors";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const FREQUENCY_OPTIONS = [
  { label: "One-Time", value: "one-time" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "Debit Card", value: "debit-card" },
  { label: "Credit Card", value: "credit-card" },
  { label: "Mobile Money", value: "mobile-money" },
  { label: "Cash", value: "cash" },
] as const;

const AddBillScreen = () => {
  const router = useRouter();
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] =
    useState<(typeof FREQUENCY_OPTIONS)[number]["value"]>("monthly");
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHOD_OPTIONS)[number]["value"]>("bank-transfer");
  const [note, setNote] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return !billName || !amount || !dueDate;
  }, [billName, amount, dueDate]);

  const handleSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }
    Keyboard.dismiss();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.back();
    }, 1200);
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
                style={{ borderBottomColor: COLORS.secondary_500, borderBottomWidth: 1 }}
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

              <SelectField
                label="Frequency"
                value={frequency}
                onSelect={(value) =>
                  setFrequency(
                    value as (typeof FREQUENCY_OPTIONS)[number]["value"],
                  )
                }
                options={FREQUENCY_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                className="mt-6"
              />

              <SelectField
                label="Payment Method"
                value={paymentMethod}
                onSelect={(value) =>
                  setPaymentMethod(
                    value as (typeof PAYMENT_METHOD_OPTIONS)[number]["value"],
                  )
                }
                options={PAYMENT_METHOD_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                className="mt-6"
              />

              <View className="mt-6">
                <Text className="text-sm text-textColor">
                  Note (Optional)
                </Text>
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
                title="Add Bill"
                className="mt-10"
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </MainContainer>
    </>
  );
};

export default AddBillScreen;

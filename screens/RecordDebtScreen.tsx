import DatePickerField from "@/components/ui/DatePickerField";
import MainContainer from "@/components/layouts/MainContainer";
import SegmentedControl from "@/components/SegmentedControl";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { DebtDirection } from "@/features/debts/types";
import { formatAmountValue, sanitizeCentsInput } from "@/lib/amount";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { cn } from "@/lib/utils";

type FormData = {
  direction: DebtDirection;
  counterpartyName: string;
  amount: string;
  date: string;
  dueDate: string;
  description: string;
};

const INITIAL_FORM: FormData = {
  direction: "borrowed",
  counterpartyName: "",
  amount: "",
  date: "",
  dueDate: "",
  description: "",
};

const SEGMENTS = [
  { key: "borrowed", label: "I Borrowed" },
  { key: "lent", label: "I Lent" },
];

const RecordDebtScreen = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [amountFocused, setAmountFocused] = useState(false);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAmountChange = (text: string) => {
    setField("amount", sanitizeCentsInput(text));
  };

  function parseDMY(dateStr: string): Date | null {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  const handleDueDateChange = (formatted: string) => {
    setField("dueDate", formatted);
    if (form.date && formatted) {
      const start = parseDMY(form.date);
      const end = parseDMY(formatted);
      if (start && end && end < start) {
        setDueDateError("Due date cannot be earlier than start date.");
      } else {
        setDueDateError(null);
      }
    }
  };

  const isValid =
    form.counterpartyName.trim().length > 0 &&
    Number(form.amount) > 0 &&
    form.date.length > 0 &&
    form.dueDate.length > 0 &&
    !dueDateError;

  const handleSave = () => {
    if (!isValid) return;
    // TODO: wire to API
    Toast.show({
      type: "success",
      text1: "Debt Recorded",
      text2: `${form.direction === "borrowed" ? "Borrowed from" : "Lent to"} ${form.counterpartyName}`,
    });
    router.back();
  };

  const nameLabel =
    form.direction === "borrowed" ? "Borrowed From" : "Lent To";

  return (
    <MainContainer edges={["bottom"]} className="bg-[#F8F9FA] pb-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* I Borrowed / I Lent toggle */}
          <View className="mb-5">
            <SegmentedControl
              segments={SEGMENTS}
              activeKey={form.direction}
              onChange={(key) => setField("direction", key as DebtDirection)}
            />
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text
              family="nunito"
              weight="medium"
              className="mb-1.5 text-sm text-textColor/70"
            >
              {nameLabel}
            </Text>
            <TextInput
              value={form.counterpartyName}
              onChangeText={(v) => setField("counterpartyName", v)}
              placeholder="Enter name..."
              placeholderTextColor="#9CA3AF"
              style={{ fontFamily: "NunitoMedium", includeFontPadding: false }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-textColor"
            />
          </View>

          {/* Amount */}
          <View className="mb-4">
            <Text
              family="nunito"
              weight="medium"
              className="mb-1.5 text-sm text-textColor/70"
            >
              Amount
            </Text>
            <View
              className={cn(
                "rounded-xl border bg-white p-4",
                amountFocused ? "border-primary_400" : "border-gray-200",
              )}
            >
              <TextInput
                value={
                  form.amount
                    ? formatAmountValue(form.amount, {
                        currencySymbol: "₦",
                        forceFixedDecimals: true,
                      })
                    : ""
                }
                onChangeText={handleAmountChange}
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
                placeholder="₦ 0.00"
                placeholderTextColor="#848484"
                keyboardType="number-pad"
                style={{ includeFontPadding: false }}
                className="p-0 text-4xl font-bold text-textColor"
              />
            </View>
          </View>

          {/* Date */}
          <View className="mb-4">
            <Text
              family="nunito"
              weight="medium"
              className="mb-1.5 text-sm text-textColor/70"
            >
              Date
            </Text>
            <DatePickerField
              value={form.date}
              onChange={(formatted) => setField("date", formatted)}
              placeholder="DD/MM/YY"
              renderSelectIcon={() => (
                <Image
                  source={require("@/assets/icons/calendar.svg")}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              )}
            />
          </View>

          {/* Due Date */}
          <View className="mb-4">
            <Text
              family="nunito"
              weight="medium"
              className="mb-1.5 text-sm text-textColor/70"
            >
              Due Date
            </Text>
            <DatePickerField
              value={form.dueDate}
              onChange={handleDueDateChange}
              placeholder="DD/MM/YY"
              renderSelectIcon={() => (
                <Image
                  source={require("@/assets/icons/calendar.svg")}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              )}
            />
            {dueDateError && (
              <Text
                family="nunito"
                weight="medium"
                className="mt-1 text-xs text-error"
              >
                {dueDateError}
              </Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text
              family="nunito"
              weight="medium"
              className="mb-1.5 text-sm text-textColor/70"
            >
              Description (Optional)
            </Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => setField("description", v)}
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                fontFamily: "NunitoRegular",
                includeFontPadding: false,
                minHeight: 100,
              }}
              className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-textColor"
            />
          </View>
        </ScrollView>

        {/* Pinned Save button */}
        <View className="bg-[#F8F9FA] px-4 pb-4 pt-2">
          <Pressable
            onPress={handleSave}
            disabled={!isValid}
            className={cn(
              "items-center justify-center rounded-xl py-4",
              isValid ? "bg-primary_400 active:opacity-90" : "bg-primary_200",
            )}
          >
            <Text
              family="nunito"
              weight="semibold"
              className={cn("text-base", isValid ? "text-white" : "text-primary_400")}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default RecordDebtScreen;

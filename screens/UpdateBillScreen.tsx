import PaymentModal, {
  PaymentModalRef,
} from "@/components/expense-planning/PaymentModal";
import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector from "@/components/ui/CategorySelector";
import SelectButton from "@/components/ui/SelectButton";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useGetCategoriesQuery } from "@/src/api/hooks";
import { useUpdateBillReminderMutation } from "@/src/api/hooks/useBillRemindersApi";
import { getBillLeadDays, setBillLeadDays } from "@/lib/localNotifications";
import { BillReminder } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const formatDateDisplay = (date: Date | null): string => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

const formatTimeDisplay = (date: Date | null): string => {
  if (!date) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseISOToDate = (isoString: string | undefined): Date | null => {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const UpdateBillScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    billId: string;
    billData?: string;
  }>();

  const existingBill = useMemo<BillReminder | null>(() => {
    if (params.billData) {
      try {
        return JSON.parse(params.billData) as BillReminder;
      } catch {
        return null;
      }
    }
    return null;
  }, [params.billData]);

  const billId = params.billId || existingBill?._id || "";

  const successTimeoutRef = useRef<number | null>(null);

  const [billName, setBillName] = useState(existingBill?.name ?? "");
  const [amount, setAmount] = useState(
    existingBill?.amount ? String(existingBill.amount) : "",
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    parseISOToDate(existingBill?.dueDate),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState(existingBill?.category ?? "");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(
    existingBill?.reminderEnabled ?? true,
  );
  const [leadDays, setLeadDays] = useState("1");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const paymentModalRef = useRef<PaymentModalRef>(null);
  const leadDaysModalRef = useRef<PaymentModalRef>(null);

  useEffect(() => {
    if (existingBill) {
      setBillName(existingBill.name);
      setAmount(String(existingBill.amount));
      setDueDate(parseISOToDate(existingBill.dueDate));
      setCategory(existingBill.category);
      setReminderEnabled(existingBill.reminderEnabled);
      getBillLeadDays(existingBill._id).then((days) => {
        if (days !== undefined) {
          setLeadDays(String(days));
        }
      });
    }
  }, [existingBill]);

  const { data: categories = [] } = useGetCategoriesQuery("budget");
  useGetCategoriesQuery("budget");

  const { mutate: updateBill, isPending: isSubmitting } =
    useUpdateBillReminderMutation(billId, {
      onSuccess: async () => {
        await setBillLeadDays(billId, parseInt(leadDays, 10));
        queryClient.invalidateQueries({ queryKey: ["billReminders"] });
        Toast.show({
          type: "success",
          text1: "Bill Updated",
          text2: "Your bill has been updated successfully.",
        });
        successTimeoutRef.current = setTimeout(() => {
          router.back();
        }, 1200);
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "Failed to update bill. Please try again.",
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

  const leadDayOptions = [
    { key: "0", label: "On due date only" },
    { key: "1", label: "1 day before" },
    { key: "2", label: "2 days before" },
    { key: "3", label: "3 days before" },
    { key: "7", label: "1 week before" },
  ];

  const openLeadDaysModal = useCallback(() => {
    leadDaysModalRef.current?.present();
    setFocusedField("leadDays");
  }, []);

  const closeLeadDaysModal = useCallback(() => {
    leadDaysModalRef.current?.dismiss();
    setFocusedField(null);
  }, []);

  const handleSelectLeadDays = useCallback((method: string) => {
    setLeadDays(method);
    leadDaysModalRef.current?.dismiss();
    setFocusedField(null);
  }, []);

  const handleOpenDatePicker = useCallback(() => {
    Keyboard.dismiss();
    setShowDatePicker(true);
    setFocusedField("dueDate");
  }, []);

  const handleOpenTimePicker = useCallback(() => {
    Keyboard.dismiss();
    setShowTimePicker(true);
    setFocusedField("dueTime");
  }, []);

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
        setFocusedField(null);
      }

      if (event.type === "set" && selectedDate) {
        setDueDate((prev) => {
          const newDate = prev ? new Date(prev) : new Date();
          newDate.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
          );
          return newDate;
        });
      }

      if (Platform.OS === "ios") {
        setShowDatePicker(false);
        setFocusedField(null);
      }
    },
    [],
  );

  const handleTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedTime?: Date) => {
      if (Platform.OS === "android") {
        setShowTimePicker(false);
        setFocusedField(null);
      }

      if (event.type === "set" && selectedTime) {
        setDueDate((prev) => {
          const newDate = prev ? new Date(prev) : new Date();
          newDate.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0,
          );
          return newDate;
        });
      }

      if (Platform.OS === "ios") {
        setShowTimePicker(false);
        setFocusedField(null);
      }
    },
    [],
  );

  const isSubmitDisabled = useMemo(() => {
    return !billName || !amount || !dueDate || !category;
  }, [billName, amount, dueDate, category]);

  const handleSubmit = () => {
    if (isSubmitDisabled || !dueDate) {
      return;
    }
    Keyboard.dismiss();

    updateBill({
      name: billName,
      amount: parseFloat(amount),
      dueDate: dueDate.toISOString(),
      category,
      ...(paymentMethod && { paymentMethod }),
      reminderEnabled,
    });
  };

  if (!billId) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Bill" }} />
        <MainContainer edges={[]} className="bg-lightMuted pb-0">
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={COLORS.error}
            />
            <Text weight="semibold" className="mt-4 text-base text-textColor">
              Bill Not Found
            </Text>
            <Text className="mt-2 text-center text-sm text-textColor/60">
              Unable to load bill data. Please go back and try again.
            </Text>
            <Button
              title="Go Back"
              className="mt-6"
              onPress={() => router.back()}
            />
          </View>
        </MainContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Bill" }} />
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
                <View className="mt-2 flex-row gap-3">
                  <Pressable
                    onPress={handleOpenDatePicker}
                    className={cn(
                      "flex-1 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                      focusedField === "dueDate" || showDatePicker
                        ? "border-primary_400"
                        : "border-gray-200",
                    )}
                    accessibilityRole="button"
                    accessibilityLabel="Select date"
                  >
                    <Text
                      className={cn(
                        "text-base",
                        dueDate ? "text-textColor" : "text-textColor/40",
                      )}
                    >
                      {formatDateDisplay(dueDate) || "DD/MM/YY"}
                    </Text>
                    <Image
                      source={require("@/assets/icons/calendar.svg")}
                      style={{ width: 20, height: 20 }}
                    />
                  </Pressable>

                  <Pressable
                    onPress={handleOpenTimePicker}
                    className={cn(
                      "flex-1 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                      focusedField === "dueTime" || showTimePicker
                        ? "border-primary_400"
                        : "border-gray-200",
                    )}
                    accessibilityRole="button"
                    accessibilityLabel="Select time"
                  >
                    <Text
                      className={cn(
                        "text-base",
                        dueDate && formatTimeDisplay(dueDate)
                          ? "text-textColor"
                          : "text-textColor/40",
                      )}
                    >
                      {formatTimeDisplay(dueDate) || "HH:MM"}
                    </Text>
                    <Ionicons name="time-outline" size={20} color="#2A3A50" />
                  </Pressable>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  themeVariant="light"
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                  themeVariant="light"
                />
              )}

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
                  isOpen={!!paymentMethod}
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

              {reminderEnabled && (
                <View className="mt-6">
                  <Text className="text-sm text-textColor">Notify me</Text>
                  <SelectButton
                    value={
                      leadDayOptions.find((m) => m.key === leadDays)?.label
                    }
                    placeholder="Select when to be notified"
                    onPress={openLeadDaysModal}
                    isOpen={!!leadDays}
                    isFocused={focusedField === "leadDays"}
                    className="mt-2"
                  />
                </View>
              )}

              <Button
                title={isSubmitting ? "Saving..." : "Save Changes"}
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
        <PaymentModal
          ref={leadDaysModalRef}
          onClose={closeLeadDaysModal}
          paymentMethods={leadDayOptions.map((m) => ({
            label: m.label,
            value: m.key,
          }))}
          selectedMethod={leadDays}
          onSelect={handleSelectLeadDays}
        />
      </MainContainer>
    </>
  );
};

export default UpdateBillScreen;

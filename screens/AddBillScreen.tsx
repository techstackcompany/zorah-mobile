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
import { useAddBillReminderMutation } from "@/src/api/hooks/useBillRemindersApi";
import { setBillLeadDays } from "@/lib/localNotifications";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

/**
 * Format a Date object to DD/MM/YY display format
 */
const formatDateDisplay = (date: Date | null): string => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

/**
 * Format a Date object to HH:MM display format (24-hour)
 */
const formatTimeDisplay = (date: Date | null): string => {
  if (!date) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const AddBillScreen = () => {
  const router = useRouter();
  const successTimeoutRef = useRef<number | null>(null);
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [leadDays, setLeadDays] = useState("1");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const paymentModalRef = useRef<PaymentModalRef>(null);
  const leadDaysModalRef = useRef<PaymentModalRef>(null);

  const { data: categories = [], isPending: isCategoriesLoading } =
    useGetCategoriesQuery("budget");
  const { mutate: addBill, isPending: isSubmitting } =
    useAddBillReminderMutation({
      onSuccess: async (data) => {
        if (data?.data?._id) {
          await setBillLeadDays(data.data._id, parseInt(leadDays, 10));
        }
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

  const handleOpenDatePicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(!showDatePicker);
    setFocusedField("dueDate");
  };

  const handleOpenTimePicker = () => {
    Keyboard.dismiss();
    setShowTimePicker(!showTimePicker);
    setFocusedField("dueTime");
  };

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

  // Validation: time selection is NOT required, only date
  const isSubmitDisabled = useMemo(() => {
    return !billName || !amount || !dueDate || !category || !paymentMethod;
  }, [billName, amount, dueDate, category, paymentMethod]);

  const handleSubmit = () => {
    if (isSubmitDisabled || !dueDate) {
      return;
    }
    Keyboard.dismiss();

    addBill({
      name: billName,
      amount: parseFloat(amount),
      dueDate: dueDate.toISOString(), // Direct ISO conversion with time
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

              {/* Date and Time Picker Fields */}
              <View className="mt-6">
                <Text className="text-sm text-textColor">Due Date</Text>
                <View className="mt-2 flex-row gap-3">
                  {/* Date Field */}
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

                  {/* Time Field */}
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

              {/* Native Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  themeVariant="light"
                />
              )}

              {/* Native Time Picker */}
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

export default AddBillScreen;

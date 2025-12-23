import PaymentModal from "@/components/expense-planning/PaymentModal";
import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import CategorySelector from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SelectButton from "@/components/ui/SelectButton";
import Text from "@/components/ui/Text";
import TextInputField from "@/components/ui/TextInputField";
import COLORS from "@/constants/colors";
import { addKeyboardBehavior, cn, getErrorMessage } from "@/lib/utils";
import {
  useAddExpenseMutation,
  useGetCategoriesQuery,
  useVoiceExpenseLoggingMutation,
} from "@/src/api/hooks";

import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Switch,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type ExpenseCategory = {
  key: string;
  label: string;
  icon: ImageSource | string;
};

type VoiceStatus = "idle" | "recording" | "detected";

type DetectedExpenseDetails = {
  amountValue: string;
  amountLabel: string;
  categoryKey?: string;
  categoryLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  summary: string;
  dateValue: string;
};

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "transfer" },
  { label: "Card", value: "card" },
  { label: "Wallet", value: "wallet" },
  { label: "Cash", value: "cash" },
];

const formatDateForInput = (value: Date) => {
  const day = `${value.getDate()}`.padStart(2, "0");
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const year = `${value.getFullYear()}`.slice(-2);
  return `${day}/${month}/${year}`;
};

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

const getPaymentMethodLabel = (value: string) =>
  PAYMENT_METHODS.find((method) => method.value === value)?.label ?? value;

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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [detectedExpense, setDetectedExpense] =
    useState<DetectedExpenseDetails | null>(null);
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

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const requestAudioPermissions = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Microphone access is required for voice recording.",
        );
      }
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
    }
  };

  useEffect(() => {
    requestAudioPermissions();
  }, []);

  useEffect(() => {
    if (expenseCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(expenseCategories[0].key);
    }
  }, [expenseCategories, selectedCategory]);

  const resetVoiceAssist = useCallback(() => {
    setVoiceStatus("idle");
    setDetectedExpense(null);
  }, []);

  const handleEntryModeChange = useCallback(
    (enabled: boolean) => {
      setIsVoiceMode(enabled);
      setFocusedField(null);
      resetVoiceAssist();
      if (enabled && isPaymentModalVisible) {
        closePaymentModal();
      }
    },
    [closePaymentModal, isPaymentModalVisible, resetVoiceAssist],
  );

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
      console.log("error", error);
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

  const transcribeMutation = useVoiceExpenseLoggingMutation({
    onSuccess: (data) => {
      console.log("Transcription result:", data);

      // Format date from YYYY-MM-DD to DD/MM/YY
      let formattedDate = "";
      if (data.date) {
        const dateObj = new Date(data.date);
        const day = `${dateObj.getDate()}`.padStart(2, "0");
        const month = `${dateObj.getMonth() + 1}`.padStart(2, "0");
        const year = `${dateObj.getFullYear()}`.slice(-2);
        formattedDate = `${day}/${month}/${year}`;
      }

      setAmount(data.amount.toString());
      setDate(formattedDate);
      setDescription(data.description);
      setPaymentMethod(data.paymentMethod);
      setSelectedCategory(data.category);

      setDetectedExpense({
        amountValue: data.amount.toString(),
        amountLabel: `₦${data.amount}`,
        categoryKey: data.category,
        categoryLabel: data.category,
        paymentMethod: data.paymentMethod,
        paymentMethodLabel: getPaymentMethodLabel(data.paymentMethod),
        summary: data.description,
        dateValue: formattedDate,
      });
      setVoiceStatus("detected");

      Toast.show({
        type: "success",
        text1: "Recording Complete",
        text2: "Expense details extracted successfully!",
      });
    },
    onError: (error) => {
      console.error("Transcription error:", error);
      setVoiceStatus("idle");
      Toast.show({
        type: "error",
        text1: "Transcription Failed",
        text2: getErrorMessage(
          error,
          "Failed to process audio. Please try again.",
        ),
      });
    },
  });

  const handleMicPress = useCallback(async () => {
    try {
      if (recorderState.isRecording) {
        // Stop recording
        await audioRecorder.stop();
        const audioUri = audioRecorder.uri;

        if (!audioUri) {
          throw new Error("No audio file was recorded");
        }

        console.log("Recording stopped. Audio URI:", audioUri);

        // Create FormData to send audio file to server
        const formData = new FormData();
        formData.append("audio", {
          uri: audioUri,
          type: "audio/m4a",
          name: "recording.m4a",
        } as any);

        setVoiceStatus("detected");
        Toast.show({
          type: "info",
          text1: "Processing",
          text2: "Transcribing your expense...",
        });

        transcribeMutation.mutate(formData);
        return;
      }

      // Start recording
      setDetectedExpense(null);
      setVoiceStatus("recording");

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      Toast.show({
        type: "info",
        text1: "Recording Started",
        text2: "Speak your expense details now...",
      });
    } catch (error) {
      console.error("Error handling microphone:", error);
      setVoiceStatus("idle");
      Toast.show({
        type: "error",
        text1: "Recording Error",
        text2: "Failed to record audio. Please try again.",
      });
    }
  }, [recorderState.isRecording, audioRecorder, transcribeMutation]);

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

  const micIsRecording = recorderState.isRecording;
  const isSubmitDisabled =
    isVoiceMode && (!detectedExpense || voiceStatus !== "detected");

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
            contentContainerStyle={{
              paddingBottom: isVoiceMode ? 240 : 400,
            }}
          >
            <View className="mt-4 gap-6">
              <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                <Text weight="semibold" className="text-base text-textColor">
                  How would you like to make an entry
                </Text>
                <View className="mt-3 flex-row items-center justify-between rounded-xl bg-lightBg px-3 py-3">
                  <Text className="text-sm text-textColor/80">
                    Switch to voice assist expense entry
                  </Text>
                  <Switch
                    value={isVoiceMode}
                    onValueChange={handleEntryModeChange}
                    trackColor={{
                      false: "#D7DCE5",
                      true: COLORS.primary_400,
                    }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#D7DCE5"
                  />
                </View>
              </View>

              {isVoiceMode ? (
                <View className="gap-5">
                  <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                    <Text
                      weight="semibold"
                      className="text-base text-textColor"
                    >
                      How it works
                    </Text>
                    <Text className="mt-2 text-sm leading-5 text-textColor/80">
                      Simply tap the microphone and say your expense. For
                      example:
                    </Text>
                    <View className="mt-3 rounded-xl bg-primary_100 px-3 py-3">
                      <Text className="text-sm text-primary_400">
                        &quot;Spent $25 on food at the restaurant&quot;
                      </Text>
                      <Text className="mt-1 text-sm text-primary_400">
                        &quot;Lunch for $18.50&quot;
                      </Text>
                    </View>
                  </View>

                  <View className="items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-6">
                    <Text
                      weight="semibold"
                      className="text-base text-textColor"
                    >
                      {micIsRecording ? "Recording" : "Ready to record"}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ busy: micIsRecording }}
                      onPress={handleMicPress}
                      className={cn(
                        "h-16 w-16 items-center justify-center rounded-full",
                        micIsRecording ? "bg-coral" : "bg-primary_400",
                      )}
                      android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      <Ionicons name="mic" size={28} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-xs text-textColor/60">
                      Tap to record expense details
                    </Text>
                  </View>

                  {detectedExpense ? (
                    <View className="rounded-2xl border border-secondary_200 bg-secondary_150 px-4 py-4">
                      <Text
                        weight="semibold"
                        className="text-base text-secondary_500"
                      >
                        Detected Information:
                      </Text>
                      <View className="mt-3 gap-2">
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="cash-outline"
                            size={18}
                            color={COLORS.secondary_500}
                          />
                          <Text className="text-sm text-textColor">
                            Amount: {detectedExpense.amountLabel}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="grid-outline"
                            size={18}
                            color={COLORS.secondary_500}
                          />
                          <Text className="text-sm text-textColor">
                            Category: {detectedExpense.categoryLabel}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="card-outline"
                            size={18}
                            color={COLORS.secondary_500}
                          />
                          <Text className="text-sm text-textColor">
                            Payment: {detectedExpense.paymentMethodLabel}
                          </Text>
                        </View>
                        <View className="flex-row items-start gap-2">
                          <Ionicons
                            name="document-text-outline"
                            size={18}
                            color={COLORS.secondary_500}
                            style={{ marginTop: 2 }}
                          />
                          <Text className="flex-1 text-sm leading-5 text-textColor/90">
                            {detectedExpense.summary}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View className="gap-6">
                  <AmountInput
                    value={amount}
                    onChangeValue={setAmount}
                    onFocus={() => setFocusedField("amount")}
                    onBlur={() =>
                      setFocusedField((prev) =>
                        prev === "amount" ? null : prev,
                      )
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
              )}
            </View>
          </ScrollView>
          <View className="px-6 pb-6">
            <PrimaryButton
              onPress={handleSubmit}
              loading={addExpenseMutation.isPending}
              label="Add New Expense"
              disabled={isSubmitDisabled}
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

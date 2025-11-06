import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  TAX_COUNTRY_OPTIONS,
  TAX_FREQUENCY_OPTIONS,
  TAX_INCOME_TYPE_OPTIONS,
  TAX_RATE_BY_INCOME,
  TaxIncomeType,
  formatCurrency,
} from "@/constants/tax";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type FocusKey =
  | "taxName"
  | "country"
  | "incomeType"
  | "filingDate"
  | "frequency"
  | "description";

const AddTaxRecordScreen = () => {
  const router = useRouter();
  const [taxName, setTaxName] = useState("");
  const [country, setCountry] =
    useState<(typeof TAX_COUNTRY_OPTIONS)[number]["value"]>("");
  const [incomeType, setIncomeType] =
    useState<(typeof TAX_INCOME_TYPE_OPTIONS)[number]["value"]>("");
  const [filingDate, setFilingDate] = useState("");
  const [frequency, setFrequency] =
    useState<(typeof TAX_FREQUENCY_OPTIONS)[number]["value"]>("monthly");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [deductibleExpense, setDeductibleExpense] = useState("");
  const [description, setDescription] = useState("");
  const [focusedField, setFocusedField] = useState<FocusKey | null>(null);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [incomeTypeModalVisible, setIncomeTypeModalVisible] = useState(false);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);

  const numericIncome = Number(incomeAmount || 0);
  const numericDeduction = Number(deductibleExpense || 0);
  const taxRate = incomeType
    ? TAX_RATE_BY_INCOME[incomeType as TaxIncomeType]
    : 0;

  const taxableIncome = Math.max(numericIncome - numericDeduction, 0);
  const estimatedTax = taxableIncome * taxRate;

  const canShowSummary = Boolean(incomeAmount || deductibleExpense);

  const selectedCountryLabel =
    TAX_COUNTRY_OPTIONS.find((option) => option.value === country)?.label ??
    "Select Country";
  const selectedIncomeTypeLabel =
    TAX_INCOME_TYPE_OPTIONS.find((option) => option.value === incomeType)
      ?.label ?? "Select Income Type";
  const selectedFrequencyLabel =
    TAX_FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.label ??
    "Select Frequency";

  const isFormValid =
    taxName.trim().length > 0 &&
    country !== "" &&
    incomeType !== "" &&
    filingDate !== "" &&
    frequency !== "" &&
    incomeAmount.trim().length > 0;

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(app)/tax-management");
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      return;
    }
    handleBackPress();
  };

  const summaryRows = useMemo(
    () => [
      { label: "Gross Income", value: formatCurrency(numericIncome) },
      { label: "Deductions", value: formatCurrency(numericDeduction) },
      { label: "Taxable Income", value: formatCurrency(taxableIncome) },
      {
        label: "Tax (%)",
        value: `${(taxRate * 100).toFixed(0)}%`,
        valueStyle: { color: COLORS.textColor },
      },
      {
        label: "Total Tax Due",
        value: formatCurrency(estimatedTax),
        valueStyle: { color: "#D83A56" },
      },
    ],
    [estimatedTax, numericDeduction, numericIncome, taxableIncome, taxRate],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainContainer edges={["top"]} className="bg-lightMuted pb-0">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={handleBackPress}
              accessibilityRole="button"
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={COLORS.textColor}
              />
            </Pressable>
            <Text weight="semibold" className="text-lg text-textColor">
              Add Record
            </Text>
            <View style={styles.backButton} />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-28"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginTop: 12 }}>
              <Text className="text-sm text-textColor/70">Tax Name</Text>
              <TextInput
                value={taxName}
                onChangeText={setTaxName}
                placeholder="Enter Name"
                placeholderTextColor="#9AA5B1"
                onFocus={() => setFocusedField("taxName")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "taxName" ? null : prev))
                }
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "taxName"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              />
            </View>

            <View style={{ marginTop: 18 }}>
              <Text className="text-sm text-textColor/70">Country</Text>
              <Pressable
                onPress={() => {
                  setCountryModalVisible(true);
                  setFocusedField("country");
                }}
                className={cn(
                  "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                  focusedField === "country"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              >
                <Text
                  className={cn(
                    "text-base",
                    country ? "text-textColor" : "text-textColor/50",
                  )}
                >
                  {selectedCountryLabel}
                </Text>
                <Ionicons
                  name={countryModalVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.textColor}
                />
              </Pressable>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text className="text-sm text-textColor/70">Income Type</Text>
              <Pressable
                onPress={() => {
                  setIncomeTypeModalVisible(true);
                  setFocusedField("incomeType");
                }}
                className={cn(
                  "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                  focusedField === "incomeType"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              >
                <Text
                  className={cn(
                    "text-base",
                    incomeType ? "text-textColor" : "text-textColor/50",
                  )}
                >
                  {selectedIncomeTypeLabel}
                </Text>
                <Ionicons
                  name={incomeTypeModalVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.textColor}
                />
              </Pressable>
            </View>

            <View style={{ marginTop: 18 }}>
              <Text className="text-sm text-textColor/70">Filing Date</Text>
              <DatePickerField
                value={filingDate}
                onChange={(formatted) => setFilingDate(formatted)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "filingDate" : null)
                }
                isFocused={focusedField === "filingDate"}
                renderSelectIcon={() => (
                  <Image
                    source={require("@/assets/icons/calendar.svg")}
                    style={{ width: 20, height: 20 }}
                  />
                )}
              />
            </View>

            <View style={{ marginTop: 18 }}>
              <Text className="text-sm text-textColor/70">
                Filing Frequency
              </Text>
              <Pressable
                onPress={() => {
                  setFrequencyModalVisible(true);
                  setFocusedField("frequency");
                }}
                className={cn(
                  "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                  focusedField === "frequency"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              >
                <Text className="text-base text-textColor">
                  {selectedFrequencyLabel}
                </Text>
                <Ionicons
                  name={frequencyModalVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.textColor}
                />
              </Pressable>
            </View>

            <View style={{ marginTop: 18 }}>
              <AmountInput
                label="Income Amount"
                value={incomeAmount}
                onChangeValue={setIncomeAmount}
              />
            </View>

            <View style={{ marginTop: 18 }}>
              <AmountInput
                label="Deductible Expense"
                value={deductibleExpense}
                onChangeValue={setDeductibleExpense}
              />
              <Text className="mt-2 text-xs text-textColor/50">
                Non taxable expenses from your income e.g., Internet, equipment
                etc.
              </Text>
            </View>

            {canShowSummary ? (
              <View style={styles.summaryCard}>
                <Text weight="semibold" className="text-base text-textColor">
                  Tax Details (Estimate)
                </Text>
                <View style={{ marginTop: 14, gap: 12 }}>
                  {summaryRows.map((row) => (
                    <View key={row.label} style={styles.summaryRow}>
                      <Text className="text-sm text-textColor/60">
                        {row.label}
                      </Text>
                      <Text
                        weight="semibold"
                        className="text-sm"
                        style={row.valueStyle}
                      >
                        {row.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ marginTop: 18 }}>
              <Text className="text-sm text-textColor/70">
                Description (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Message..."
                placeholderTextColor="#9AA5B1"
                onFocus={() => setFocusedField("description")}
                onBlur={() =>
                  setFocusedField((prev) =>
                    prev === "description" ? null : prev,
                  )
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "description"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              />
            </View>
          </ScrollView>

          <View style={styles.submitBar}>
            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              disabled={!isFormValid}
              style={[
                styles.submitButton,
                !isFormValid ? styles.submitButtonDisabled : null,
              ]}
            >
              <Text
                weight="semibold"
                className="text-base"
                style={{
                  color: isFormValid ? "#FFFFFF" : "rgba(34, 42, 62, 0.35)",
                }}
              >
                Add Record
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <SelectionModal
          title="Country"
          visible={countryModalVisible}
          options={TAX_COUNTRY_OPTIONS.map((option) => ({
            key: option.value,
            label: option.label,
            selected: option.value === country,
          }))}
          onClose={() => {
            setCountryModalVisible(false);
            setFocusedField(null);
          }}
          onSelect={(value) => {
            setCountry(value as (typeof TAX_COUNTRY_OPTIONS)[number]["value"]);
            setCountryModalVisible(false);
            setFocusedField(null);
          }}
        />

        <SelectionModal
          title="Income Type"
          visible={incomeTypeModalVisible}
          options={TAX_INCOME_TYPE_OPTIONS.map((option) => ({
            key: option.value,
            label: option.label,
            selected: option.value === incomeType,
          }))}
          onClose={() => {
            setIncomeTypeModalVisible(false);
            setFocusedField(null);
          }}
          onSelect={(value) => {
            setIncomeType(
              value as (typeof TAX_INCOME_TYPE_OPTIONS)[number]["value"],
            );
            setIncomeTypeModalVisible(false);
            setFocusedField(null);
          }}
        />

        <SelectionModal
          title="Frequency"
          visible={frequencyModalVisible}
          options={TAX_FREQUENCY_OPTIONS.map((option) => ({
            key: option.value,
            label: option.label,
            selected: option.value === frequency,
          }))}
          onClose={() => {
            setFrequencyModalVisible(false);
            setFocusedField(null);
          }}
          onSelect={(value) => {
            setFrequency(
              value as (typeof TAX_FREQUENCY_OPTIONS)[number]["value"],
            );
            setFrequencyModalVisible(false);
            setFocusedField(null);
          }}
        />
      </MainContainer>
    </>
  );
};

type SelectionOption = {
  key: string;
  label: string;
  selected: boolean;
};

type SelectionModalProps = {
  title: string;
  visible: boolean;
  options: SelectionOption[];
  onSelect: (key: string) => void;
  onClose: () => void;
};

const SelectionModal = ({
  title,
  visible,
  options,
  onSelect,
  onClose,
}: SelectionModalProps) => {
  return (
    <SlideUpModal
      visible={visible}
      onClose={onClose}
      title={title}
      headerBackgroundColor={COLORS.primary_400}
      headerTextColor="#FFFFFF"
    >
      <View style={{ gap: 10 }}>
        {options.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            accessibilityRole="button"
            style={styles.selectionRow}
          >
            <Text
              weight="semibold"
              className={`text-sm ${option.selected ? "text-textColor" : "text-textColor/70"}`}
            >
              {option.label}
            </Text>
            <Ionicons
              name={option.selected ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={
                option.selected ? COLORS.primary_400 : "rgba(34,42,62,0.3)"
              }
            />
          </Pressable>
        ))}
      </View>
    </SlideUpModal>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#FAFAFA",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#EEF1F6",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submitBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E7EAF0",
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: COLORS.primary_400,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    backgroundColor: "#E3E8F1",
  },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
});

export default AddTaxRecordScreen;

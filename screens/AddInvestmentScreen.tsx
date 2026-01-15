import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import DatePickerField from "@/components/ui/DatePickerField";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { INVESTMENT_TYPES, PROVIDER_GROUPS } from "@/constants/investments";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

const AddInvestmentScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const typeModalVisible = useSharedValue(false);
  const providerModalVisible = useSharedValue(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.back();
    }, 1800);
  }, [router]);

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View className="flex-1">
          {showSuccess ? (
            <View
              style={{
                backgroundColor: "#DFF5E5",
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <Text weight="semibold" className="text-sm text-textColor">
                Investment added successfully
              </Text>
            </View>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-32"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Name/Asset</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Dangote Cement Stock"
                placeholderTextColor="#9AA5B1"
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "name"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
                onFocus={() => setFocusedField("name")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "name" ? null : prev))
                }
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Investment Type</Text>
              <Pressable
                onPress={() => {
                  typeModalVisible.value = true;
                  setFocusedField("investmentType");
                }}
                className={cn(
                  "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                  focusedField === "investmentType"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              >
                <Text
                  className={cn(
                    "text-base",
                    investmentType ? "text-textColor" : "text-textColor/50",
                  )}
                >
                  {investmentType || "Select Type"}
                </Text>
                <Ionicons
                  name={
                    focusedField === "investmentType"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#2A3A50"
                />
              </Pressable>
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">
                Platform Provider
              </Text>
              <Pressable
                onPress={() => {
                  providerModalVisible.value = true;
                  setFocusedField("provider");
                }}
                className={cn(
                  "mt-2 flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
                  focusedField === "provider"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              >
                <Text
                  className={cn(
                    "text-base",
                    provider ? "text-textColor" : "text-textColor/50",
                  )}
                >
                  {provider || "Select Provider"}
                </Text>
                <Ionicons
                  name={
                    focusedField === "provider" ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#2A3A50"
                />
              </Pressable>
            </View>

            <View className="mt-6">
              <Text className="mb-1.5 text-sm text-textColor/70">
                Amount Invested
              </Text>
              <AmountInput
                value={amount}
                onChangeValue={setAmount}
                onFocus={() => setFocusedField("amount")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "amount" ? null : prev))
                }
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Purchase Date</Text>
              <DatePickerField
                value={purchaseDate}
                onChange={(formatted) => setPurchaseDate(formatted)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "purchaseDate" : null)
                }
                isFocused={focusedField === "purchaseDate"}
                renderSelectIcon={() => (
                  <Image
                    source={require("@/assets/icons/calendar.svg")}
                    style={{ width: 20, height: 20 }}
                  />
                )}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Due Date</Text>
              <DatePickerField
                value={dueDate}
                onChange={(formatted) => setDueDate(formatted)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "dueDate" : null)
                }
                isFocused={focusedField === "dueDate"}
                renderSelectIcon={() => (
                  <Image
                    source={require("@/assets/icons/calendar.svg")}
                    style={{ width: 20, height: 20 }}
                  />
                )}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Note (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Message..."
                placeholderTextColor="#9AA5B1"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="mt-2 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-textColor"
              />
            </View>
          </ScrollView>
        </View>

        <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pb-8 pt-4 shadow-2xl">
          <Pressable
            onPress={handleSubmit}
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded-2xl bg-primary_400"
          >
            <Text weight="semibold" className="text-base text-white">
              Add Investment
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <SlideUpModal
        isOpen={typeModalVisible}
        onClose={() => {
          typeModalVisible.value = false;
          setFocusedField(null);
        }}
        title="Investment Type"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
        className="px-3 py-2"
      >
        <View className="space-y-3">
          {INVESTMENT_TYPES.map((type) => {
            const isSelected = investmentType === type.label;
            return (
              <Pressable
                key={type.id}
                onPress={() => {
                  setInvestmentType(type.label);
                  typeModalVisible.value = false;
                  setFocusedField(null);
                }}
                accessibilityRole="button"
                className={cn(
                  "rounded-2xl  px-2 py-4",
                  isSelected
                    ? "border-primary_400 bg-primary_400/5"
                    : "border-gray-200",
                )}
              >
                <Text
                  weight="semibold"
                  className={cn(
                    "text-sm",
                    isSelected ? "text-primary_400" : "text-textColor",
                  )}
                >
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SlideUpModal>

      <SlideUpModal
        isOpen={providerModalVisible}
        onClose={() => {
          providerModalVisible.value = false;
          setFocusedField(null);
        }}
        title="Select Provider"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
      >
        <View className="gap-4">
          {PROVIDER_GROUPS.map((group) => (
            <View key={group.id}>
              <Text weight="semibold" className="text-sm  text-textColor">
                {group.label}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-3">
                {group.options.map((option) => {
                  const isSelected = provider === option.label;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        setProvider(option.label);
                        providerModalVisible.value = false;
                        setFocusedField(null);
                      }}
                      accessibilityRole="button"
                      className={cn(
                        "rounded-lg border px-4 py-3",
                        isSelected
                          ? "border-primary_400 bg-primary_400/5"
                          : "border-gray-200",
                      )}
                    >
                      <Text
                        weight="semibold"
                        className={cn(
                          "text-xs",
                          isSelected ? "text-primary_400" : "text-textColor",
                        )}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

export default AddInvestmentScreen;

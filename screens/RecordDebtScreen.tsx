import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
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

type DebtFormTab = "borrowed" | "lent";

const RecordDebtScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DebtFormTab>("borrowed");
  const [counterparty, setCounterparty] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.back();
    }, 1800);
  }, [router]);

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
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
                Debt Recorded Successfully
              </Text>
            </View>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-32"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mt-6 rounded-full bg-gray-100 p-1">
              <View className="flex-row rounded-full bg-[#E9EDF5] p-1">
                {(["borrowed", "lent"] as DebtFormTab[]).map((tab) => {
                  const isActive = tab === activeTab;
                  return (
                    <Pressable
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      className={cn(
                        "flex-1 rounded-full py-3",
                        isActive ? "bg-white shadow-sm" : "",
                      )}
                    >
                      <Text
                        weight={isActive ? "semibold" : "medium"}
                        className={cn(
                          "text-center text-sm",
                          isActive ? "text-textColor" : "text-textColor/60",
                        )}
                      >
                        {tab === "borrowed" ? "I Borrowed" : "I Lent"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-8">
              <Text className="text-sm text-textColor/70">
                {activeTab === "borrowed" ? "Borrowed From" : "Lent To"}
              </Text>
              <TextInput
                value={counterparty}
                onChangeText={setCounterparty}
                placeholder="Enter name"
                placeholderTextColor="#9AA5B1"
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "counterparty"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
                onFocus={() => setFocusedField("counterparty")}
                onBlur={() =>
                  setFocusedField((prev) =>
                    prev === "counterparty" ? null : prev,
                  )
                }
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Amount</Text>
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
              <Text className="text-sm text-textColor/70">Date</Text>
              <DatePickerField
                value={date}
                onChange={(formatted) => setDate(formatted)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "date" : null)
                }
                isFocused={focusedField === "date"}
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
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">
                Description (Optional)
              </Text>
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
              Save
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default RecordDebtScreen;

import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrency } from "@/constants/investments";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

type GoalCategoryOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  accent: string;
};

const GOAL_CATEGORIES: GoalCategoryOption[] = [
  {
    id: "education",
    label: "Education",
    icon: "school-outline",
    background: "#EFF3FF",
    accent: COLORS.primary_400,
  },
  {
    id: "home",
    label: "Home",
    icon: "home-outline",
    background: "#F2F6FF",
    accent: "#2F66F6",
  },
  {
    id: "travel",
    label: "Travel",
    icon: "airplane-outline",
    background: "#EFFEFA",
    accent: COLORS.secondary_500,
  },
  {
    id: "car",
    label: "Car",
    icon: "car-outline",
    background: "#FFF5E8",
    accent: "#F8924F",
  },
];

const SavingsGoalCreateScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(GOAL_CATEGORIES[0].id);
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const formattedAmount = useMemo(
    () => (amount ? formatCurrency(Number(amount)) : "₦0.00"),
    [amount],
  );

  const handleSubmit = () => {
    Keyboard.dismiss();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.back();
    }, 1500);
  };

  const isSubmitDisabled = !name || !amount || !targetDate;

  return (
    <MainContainer edges={[]} className="bg-lightMuted pb-0">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View className="flex-1">
          {showSuccess ? (
            <View className="bg-[#DFF5E5] px-6 py-4">
              <Text weight="semibold" className="text-sm text-textColor">
                Goal created successfully
              </Text>
            </View>
          ) : null}

          <ScrollView
            contentContainerClassName="px-6 pb-32"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Goal name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter goal name"
                placeholderTextColor="#9AA5B1"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "name"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
              />
            </View>

            <View className="mt-6">
              <AmountInput
                label="Target Amount"
                value={amount}
                onChangeValue={setAmount}
                onFocus={() => setFocusedField("amount")}
                onBlur={() => setFocusedField(null)}
              />
              <Text className="mt-2 text-xs text-textColor/60">
                Current: {formattedAmount}
              </Text>
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Goal Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
                className="mt-3"
              >
                {GOAL_CATEGORIES.map((option) => {
                  const isActive = option.id === category;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      onPress={() => setCategory(option.id)}
                      className={cn(
                        "w-32 items-center rounded-2xl border px-4 py-4 bg-white",
                        !isActive && "border-gray-200",
                      )}
                      style={{
                        borderColor: isActive ? COLORS.primary_400 : "#E5E9F2",
                        backgroundColor: isActive ? "#EFF3FF" : "#FFFFFF",
                      }}
                    >
                      <View
                        className="h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: option.background }}
                      >
                        <Ionicons
                          name={option.icon}
                          size={22}
                          color={option.accent}
                        />
                      </View>
                      <Text className="mt-3 text-sm text-textColor">
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Target Date</Text>
              <DatePickerField
                value={targetDate}
                onChange={(date) => setTargetDate(date)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "date" : null)
                }
                isFocused={focusedField === "date"}
                renderSelectIcon={() => (
                  <Ionicons name="calendar-outline" size={20} color="#1D2939" />
                )}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor/70">Note (Optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add note..."
                placeholderTextColor="#9AA5B1"
                multiline
                numberOfLines={4}
                onFocus={() => setFocusedField("note")}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "mt-2 rounded-2xl border bg-white px-4 py-4 text-base text-textColor",
                  focusedField === "note"
                    ? "border-primary_400"
                    : "border-gray-200",
                )}
                style={{ textAlignVertical: "top", minHeight: 120 }}
              />
            </View>

            <Button
              title="Create Goal"
              className="mt-10"
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default SavingsGoalCreateScreen;

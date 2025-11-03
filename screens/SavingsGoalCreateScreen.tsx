import MainContainer from "@/components/layouts/MainContainer";
import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import CategorySelector, {
  type CategoryItem,
} from "@/components/ui/CategorySelector";
import DatePickerField from "@/components/ui/DatePickerField";
import Text from "@/components/ui/Text";
import { formatCurrency } from "@/constants/investments";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";

type GoalCategory = "education" | "home" | "travel" | "car";

const GOAL_CATEGORIES: readonly CategoryItem<GoalCategory>[] = [
  {
    key: "education",
    label: "Education",
    icon: require("@/assets/images/savings_goals/education.png"),
  },
  {
    key: "home",
    label: "Home",
    icon: require("@/assets/images/savings_goals/home.png"),
  },
  {
    key: "travel",
    label: "Travel",
    icon: require("@/assets/images/savings_goals/travel.png"),
  },
  {
    key: "car",
    label: "Car",
    icon: require("@/assets/images/savings_goals/car.png"),
  },
] as const;

const SavingsGoalCreateScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<GoalCategory>(
    GOAL_CATEGORIES[0].key,
  );
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
              <Text className="text-sm text-textColor">Goal name</Text>
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
                labelCLassName="text-textColor"
                onChangeValue={setAmount}
                onFocus={() => setFocusedField("amount")}
                onBlur={() => setFocusedField(null)}
              />
              {/* <Text className="mt-2 text-xs text-textColor/60">
                Current: {formattedAmount}
              </Text> */}
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor">Goal Category</Text>
              <CategorySelector
                categories={GOAL_CATEGORIES}
                selectedKey={category}
                onSelect={setCategory}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor">Target Date</Text>
              <DatePickerField
                value={targetDate}
                onChange={(date) => setTargetDate(date)}
                onFocusChange={(focused) =>
                  setFocusedField(focused ? "date" : null)
                }
                isFocused={focusedField === "date"}
                renderSelectIcon={() => (
                  <Image
                    source={require("@/assets/icons/calendar.svg")}
                    style={{ width: 20, height: 20 }}
                  />
                )}
              />
            </View>

            <View className="mt-6">
              <Text className="text-sm text-textColor">Note (Optional)</Text>
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

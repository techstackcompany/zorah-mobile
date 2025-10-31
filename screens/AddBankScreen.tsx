import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const BANK_OPTIONS = [
  "GTBank",
  "Zenith Bank",
  "Access Bank",
  "UBA",
  "Kuda Bank",
  "Opay",
  "PalmPay",
  "Moniepoint",
  "First Bank",
  "Jaiz Bank",
] as const;

const AddBankScreen = () => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (!selectedBank) {
      return;
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {showSuccess ? (
          <View style={styles.successBanner}>
            <Text weight="semibold" className="text-sm text-textColor">
              Bank linked successfully
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text weight="semibold" className="text-base text-textColor">
            Bank Accounts
          </Text>
          <Text className="mt-2 text-sm text-textColor/60">
            Select the bank you want to link with PocketMonie.
          </Text>

          <View className="mt-6 space-y-3">
            {BANK_OPTIONS.map((bank) => {
              const selected = selectedBank === bank;
              return (
                <Pressable
                  key={bank}
                  onPress={() => setSelectedBank(bank)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={styles.optionRow}
                >
                  <View
                    className={cn(
                      "h-6 w-6 items-center justify-center rounded-md border",
                      selected ? "border-primary_400 bg-primary_400" : "border-gray-300",
                    )}
                  >
                    {selected ? (
                      <View className="h-2.5 w-2.5 rounded-[3px] bg-white" />
                    ) : null}
                  </View>
                  <Text weight="semibold" className="text-sm text-textColor">
                    {bank}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.noteBox}>
            <Text className="text-xs text-textColor/60">
              Bank notifications help PocketMonie identify new transactions
              automatically by reading bank SMS alerts.
            </Text>
          </View>

          <Pressable
            style={[
              styles.saveButton,
              { opacity: selectedBank ? 1 : 0.5 },
            ]}
            onPress={handleSave}
            accessibilityRole="button"
            disabled={!selectedBank}
          >
            <Text weight="semibold" className="text-base text-white">
              Add Bank
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 18,
  },
  successBanner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#DFF5E5",
    borderWidth: 1,
    borderColor: "rgba(50,163,77,0.3)",
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  noteBox: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E6F0",
    padding: 14,
    backgroundColor: "#F6F8FF",
  },
  saveButton: {
    marginTop: 28,
    borderRadius: 18,
    backgroundColor: COLORS.primary_400,
    paddingVertical: 16,
    alignItems: "center",
  },
});

export default AddBankScreen;


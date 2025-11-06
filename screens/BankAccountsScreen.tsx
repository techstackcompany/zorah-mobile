import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const LINKED_BANKS = [
  { id: "gtb", name: "GTBank", account: "**** 2456" },
  { id: "zenith", name: "Zenith Bank", account: "**** 1189" },
  { id: "kuda", name: "Kuda Bank", account: "**** 7345" },
] as const;

const BankAccountsScreen = () => {
  const router = useRouter();

  return (
    <MainContainer edges={["top"]} className="bg-lightMuted">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerCard}>
          <Text weight="semibold" className="text-base text-textColor">
            Linked Accounts
          </Text>
          <Text className="mt-2 text-sm text-textColor/60">
            Manage the bank accounts that sync transactions into Zorah.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          {LINKED_BANKS.map((bank, index) => (
            <View
              key={bank.id}
              style={[
                styles.bankRow,
                index !== LINKED_BANKS.length - 1
                  ? { borderBottomWidth: 1, borderBottomColor: "#EEF1F6" }
                  : null,
              ]}
            >
              <View style={styles.bankIcon}>
                <Ionicons name="wallet-outline" size={18} color={COLORS.primary_400} />
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="semibold" className="text-sm text-textColor">
                  {bank.name}
                </Text>
                <Text className="mt-1 text-xs text-textColor/60">
                  {bank.account}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary_500} />
            </View>
          ))}
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(app)/profile/add-bank")}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary_400} />
          <Text weight="semibold" className="ml-2 text-base text-primary_400">
            Add Bank
          </Text>
        </Pressable>
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
  headerCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  bankIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F4FD",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.primary_400,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BankAccountsScreen;

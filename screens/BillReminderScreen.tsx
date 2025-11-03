import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { formatCurrency } from "@/constants/investments";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

type BillStatus = "due" | "paid" | "overdue";

type BillRecord = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  category: keyof typeof BILL_CATEGORY_META;
  reminderEnabled: boolean;
};

type FilterKey = "all" | "overdue" | "paid";

const BILL_FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

const BILL_CATEGORY_META = {
  electricity: {
    icon: "flash-outline" as const,
    accent: "#F2994A",
    background: "#FFF5E6",
  },
  phone: {
    icon: "call-outline" as const,
    accent: "#27AE60",
    background: "#E8F7EE",
  },
  rent: {
    icon: "home-outline" as const,
    accent: "#6C5DD3",
    background: "#F1EEFF",
  },
  internet: {
    icon: "wifi-outline" as const,
    accent: "#2D9CDB",
    background: "#E8F4FF",
  },
  water: {
    icon: "water-outline" as const,
    accent: "#56CCF2",
    background: "#E6F9FF",
  },
} as const;

const INITIAL_BILLS: BillRecord[] = [
  {
    id: "electricity",
    name: "Electricity Bill",
    amount: 2500,
    dueDate: "2025-09-30",
    status: "overdue",
    category: "electricity",
    reminderEnabled: true,
  },
  {
    id: "internet",
    name: "Internet Bill",
    amount: 10350,
    dueDate: "2025-09-30",
    status: "due",
    category: "internet",
    reminderEnabled: true,
  },
  {
    id: "water",
    name: "Water Bill",
    amount: 500,
    dueDate: "2025-09-30",
    status: "overdue",
    category: "water",
    reminderEnabled: true,
  },
  {
    id: "phone",
    name: "Phone Bill",
    amount: 2500,
    dueDate: "2025-08-30",
    status: "paid",
    category: "phone",
    reminderEnabled: true,
  },
  {
    id: "house-rent",
    name: "House Rent",
    amount: 45000,
    dueDate: "2025-08-30",
    status: "paid",
    category: "rent",
    reminderEnabled: true,
  },
];

const MONTHLY_SUMMARY = {
  total: 50000,
  paid: 10210,
  due: 39483,
};

const BillReminderScreen = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [records, setRecords] = useState<BillRecord[]>(INITIAL_BILLS);

  const filteredRecords = useMemo(() => {
    if (activeFilter === "all") {
      return records;
    }
    if (activeFilter === "overdue") {
      return records.filter((record) => record.status === "overdue");
    }
    return records.filter((record) => record.status === "paid");
  }, [activeFilter, records]);

  const overdueRecords = useMemo(
    () => records.filter((record) => record.status === "overdue"),
    [records],
  );

  const overdueTotal = useMemo(
    () => overdueRecords.reduce((sum, record) => sum + record.amount, 0),
    [overdueRecords],
  );

  const formattedSummary = useMemo(
    () => ({
      total: formatCurrency(MONTHLY_SUMMARY.total),
      paid: formatCurrency(MONTHLY_SUMMARY.paid),
      due: formatCurrency(MONTHLY_SUMMARY.due),
    }),
    [],
  );

  const handleToggleReminder = (id: string, value: boolean) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, reminderEnabled: value } : record,
      ),
    );
  };

  const handleMarkAsPaid = (id: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id
          ? {
              ...record,
              status: "paid" as const,
            }
          : record,
      ),
    );
  };

  const handleAddBill = () => {
    router.push("/(app)/bill-reminder/add-bill");
  };

  const sectionTitle =
    activeFilter === "all" ? "All Bills" : "My Bills";
  const totalBillsLabel =
    activeFilter === "all"
      ? `${records.length} Bills`
      : `${filteredRecords.length} Bills`;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Bills Reminder",
          headerRight: () => (
            <Pressable
              onPress={handleAddBill}
              accessibilityRole="button"
              accessibilityLabel="Add Bill"
              className="h-10 w-10 items-center justify-center rounded-full bg-primary_400/10"
            >
              <Image
                source={require("@/assets/icons/add-budget.svg")}
                style={{ width: 20, height: 20 }}
                tintColor={COLORS.primary_400}
              />
            </Pressable>
          ),
        }}
      />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs uppercase text-textColor/60">
                  Monthly Bills
                </Text>
                <Text
                  weight="bold"
                  className="mt-2 text-3xl text-textColor"
                >
                  {formattedSummary.total}
                </Text>
              </View>

              <View style={styles.summaryBreakdown}>
                <View style={styles.summaryBreakdownItem}>
                  <View style={styles.summaryBadgeHeader}>
                    <View
                      style={[
                        styles.summaryDot,
                        { backgroundColor: "#2FA89A" },
                      ]}
                    />
                    <Text className="text-xs text-textColor/70">Paid</Text>
                  </View>
                  <Text weight="bold" className="text-base text-secondary_500">
                    {formattedSummary.paid}
                  </Text>
                </View>
                <View style={styles.summaryBreakdownItem}>
                  <View style={styles.summaryBadgeHeader}>
                    <View
                      style={[
                        styles.summaryDot,
                        { backgroundColor: "#EB5757" },
                      ]}
                    />
                    <Text className="text-xs text-textColor/70">Due</Text>
                  </View>
                  <Text weight="bold" className="text-base text-[#EB5757]">
                    {formattedSummary.due}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.segmentWrapper}>
            {BILL_FILTERS.map((tab) => {
              const isActive = tab.key === activeFilter;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setActiveFilter(tab.key)}
                  style={[
                    styles.segmentButton,
                    isActive ? styles.segmentButtonActive : null,
                  ]}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={`text-sm ${isActive ? "text-textColor" : "text-textColor/60"}`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {overdueRecords.length > 0 && activeFilter !== "paid" ? (
            <View style={styles.overdueNotice}>
              <View style={styles.overdueBadge} />
              <View style={{ flex: 1 }}>
                <Text weight="semibold" className="text-sm text-[#C0392B]">
                  Overdue Bill
                </Text>
                <Text className="mt-1 text-xs text-[#C0392B]">
                  You have {overdueRecords.length} overdue bill
                  {overdueRecords.length > 1 ? "s" : ""} totaling{" "}
                  {formatCurrency(overdueTotal)}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text weight="semibold" className="text-base text-textColor">
              {sectionTitle}
            </Text>
            <Text className="text-xs text-primary_400">{totalBillsLabel}</Text>
          </View>

          <View style={styles.billList}>
            {filteredRecords.map((bill) => (
              <View key={bill.id} style={styles.billCard}>
                <View style={styles.billCardHeader}>
                  <View
                    style={[
                      styles.billIconBackground,
                      {
                        backgroundColor:
                          BILL_CATEGORY_META[bill.category].background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={BILL_CATEGORY_META[bill.category].icon}
                      size={22}
                      color={BILL_CATEGORY_META[bill.category].accent}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text weight="semibold" className="text-base text-textColor">
                      {bill.name}
                    </Text>
                    <Text className="mt-1 text-xs text-textColor/60">
                      Due:{" "}
                      {new Date(bill.dueDate).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-textColor/60">Reminder</Text>
                    <Switch
                      value={bill.reminderEnabled}
                      onValueChange={(value) =>
                        handleToggleReminder(bill.id, value)
                      }
                      trackColor={{ false: "#D7DCE5", true: COLORS.primary_400 }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#D7DCE5"
                    />
                  </View>
                </View>

                <View style={styles.billCardFooter}>
                  <Text weight="bold" className="text-lg text-textColor">
                    {formatCurrency(bill.amount)}
                  </Text>
                  {bill.status === "paid" ? (
                    <View style={styles.paidBadge}>
                      <Image
                        source={require("@/assets/icons/circle-check.svg")}
                        style={{ width: 18, height: 18 }}
                        tintColor={COLORS.secondary_500}
                      />
                      <Text
                        weight="semibold"
                        className="ml-2 text-sm text-secondary_500"
                      >
                        Paid
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleMarkAsPaid(bill.id)}
                      style={styles.markAsPaidButton}
                    >
                      <Text weight="semibold" className="text-sm text-white">
                        Mark as Paid
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text weight="semibold" className="text-base text-textColor">
                No bills found
              </Text>
              <Text className="mt-2 text-sm text-textColor/60 text-center">
                Add a new bill or adjust your filter to see reminders.
              </Text>
              <Button title="Add Bill" className="mt-5" onPress={handleAddBill} />
            </View>
          ) : null}
        </ScrollView>
      </MainContainer>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 20,
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: "#E5ECFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  summaryBreakdown: {
    gap: 12,
    alignItems: "flex-end",
  },
  summaryBreakdownItem: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 132,
    shadowColor: "#1A1F36",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
    gap: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  segmentWrapper: {
    flexDirection: "row",
    borderRadius: 24,
    backgroundColor: "#EEF1F6",
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#1A1F36",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  overdueNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FAD4D4",
    backgroundColor: "#FFF3F3",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  overdueBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EB5757",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  billList: {
    gap: 16,
  },
  billCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    shadowColor: "#1A1F36",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  billCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  billIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  billCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary_150,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  markAsPaidButton: {
    backgroundColor: COLORS.primary_400,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyState: {
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
});

export default BillReminderScreen;

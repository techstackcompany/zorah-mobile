import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  DEBT_STATUS_META,
  DEBT_TYPE_META,
  DebtRecord,
  DebtStatus,
  DebtType,
  MOCK_DEBTS,
  formatCurrency,
} from "@/constants/debt";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type TabKey = "all" | DebtType;

const STATUS_FILTERS: { key: DebtStatus; label: string }[] = [
  { key: "outstanding", label: "Outstanding" },
  { key: "overdue", label: "Overdue" },
  { key: "settled", label: "Paid" },
];

const DATE_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "lastWeek", label: "Last Week" },
  { key: "month", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "custom", label: "Custom Range" },
] as const;

const DebtTrackerScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchValue, setSearchValue] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState<Set<DebtStatus>>(
    () => new Set(["outstanding", "overdue", "settled"]),
  );
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<(typeof DATE_FILTERS)[number]["key"]>("all");

  const totals = useMemo(() => {
    return MOCK_DEBTS.reduce(
      (acc, record) => {
        if (record.type === "borrowed") {
          acc.borrowed += record.amount;
        } else {
          acc.lent += record.amount;
        }
        return acc;
      },
      { borrowed: 0, lent: 0 },
    );
  }, []);

  const filteredRecords = useMemo(() => {
    return MOCK_DEBTS.filter((record) => {
      if (activeTab !== "all" && record.type !== activeTab) {
        return false;
      }

      if (!activeStatuses.has(record.status)) {
        return false;
      }

      if (searchValue.trim()) {
        const keyword = searchValue.trim().toLowerCase();
        if (
          !record.name.toLowerCase().includes(keyword) &&
          !record.note.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      if (selectedDateFilter === "today") {
        const today = new Date().toDateString();
        return (
          new Date(record.date).toDateString() === today ||
          new Date(record.dueDate).toDateString() === today
        );
      }

      if (selectedDateFilter === "week") {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        const dueDate = new Date(record.dueDate);
        return dueDate >= startOfWeek && dueDate <= endOfWeek;
      }

      if (selectedDateFilter === "lastWeek") {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() - 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        const dueDate = new Date(record.dueDate);
        return dueDate >= startOfWeek && dueDate <= endOfWeek;
      }

      if (selectedDateFilter === "month") {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const dueDate = new Date(record.dueDate);
        return dueDate.getMonth() === month && dueDate.getFullYear() === year;
      }

      if (selectedDateFilter === "lastMonth") {
        const now = new Date();
        const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year =
          now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const dueDate = new Date(record.dueDate);
        return dueDate.getMonth() === month && dueDate.getFullYear() === year;
      }

      return true;
    });
  }, [activeTab, searchValue, activeStatuses, selectedDateFilter]);

  const handleToggleStatus = (status: DebtStatus) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      if (next.size === 0) {
        return new Set(["outstanding", "overdue", "settled"]);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setActiveStatuses(new Set(["outstanding", "overdue", "settled"]));
    setSelectedDateFilter("all");
  };

  const handleNavigateToRecord = () => {
    router.push("/(app)/debt-tracker/record");
  };

  const handleOpenDetails = (record: DebtRecord) => {
    router.push({
      pathname: "/(app)/debt-tracker/details",
      params: { id: record.id },
    });
  };

  return (
    <MainContainer edges={[]} className="bg-lightMuted">
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryRow}>
            <SummaryCard
              label="You Borrowed"
              amount={totals.borrowed}
              background="#E7F7F0"
              icon="arrow-down"
              iconColor="#2FA89A"
              accentColor={COLORS.secondary_500}
            />
            <SummaryCard
              label="You Lent"
              amount={totals.lent}
              background="#FFE9DD"
              icon="arrow-up"
              iconColor="#E9781A"
              accentColor={COLORS.coral}
            />
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color="#8A94A6" />
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder="Search name..."
                placeholderTextColor="#8A94A6"
                style={styles.searchInput}
              />
              <Pressable accessibilityRole="button" hitSlop={8}>
                <Image
                  source={require("@/assets/icons/mic.svg")}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
            </View>
            <Pressable
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
              accessibilityRole="button"
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={COLORS.tertiary}
              />
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            {(["all", "borrowed", "lent"] as TabKey[]).map((tab) => {
              const isActive = tab === activeTab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.tabChip,
                    isActive ? styles.tabChipActive : styles.tabChipInactive,
                  ]}
                >
                  <Text
                    weight={isActive ? "semibold" : "medium"}
                    className={`text-sm ${isActive ? "text-textColor" : "text-textColor/60"}`}
                  >
                    {tab === "all"
                      ? "All"
                      : tab === "borrowed"
                        ? "Borrowed"
                        : "Lent"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.listContainer}>
            {filteredRecords.map((record) => (
              <Pressable
                key={record.id}
                style={styles.debtCard}
                onPress={() => handleOpenDetails(record)}
                accessibilityRole="button"
              >
                <View style={styles.debtCardHeader}>
                  <View>
                    <Text weight="bold" className="text-base text-textColor">
                      {record.name}
                    </Text>
                    <View style={styles.typeRow}>
                      <Text
                        className="text-xs"
                        style={{
                          color: DEBT_STATUS_META[record.status].textColor,
                        }}
                      >
                        {DEBT_TYPE_META[record.type].subLabel}
                      </Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text weight="bold" className="text-lg text-textColor">
                        {formatCurrency(record.amount)}
                      </Text>
                      <Text className="text-xs text-textColor/60">
                        Due:{" "}
                        {new Date(record.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            DEBT_STATUS_META[record.status].background,
                          borderColor: DEBT_STATUS_META[record.status].border,
                        },
                      ]}
                    >
                      <Text
                        weight="semibold"
                        className="text-[11px]"
                        style={{
                          color: DEBT_STATUS_META[record.status].textColor,
                        }}
                      >
                        {DEBT_STATUS_META[record.status].label}
                      </Text>
                    </View>
                    <Pressable
                      disabled={record.status === "settled"}
                      style={[
                        styles.reminderButton,
                        record.status === "settled"
                          ? styles.reminderButtonDisabled
                          : null,
                      ]}
                      onPress={() => {}}
                      accessibilityRole="button"
                    >
                      <Text
                        weight="semibold"
                        className="text-xs"
                        style={{
                          color:
                            record.status === "settled"
                              ? "#A0A8B2"
                              : COLORS.primary_400,
                        }}
                      >
                        {record.status === "settled"
                          ? "Reminder Sent"
                          : "Send Reminder"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.recordButton}
            onPress={handleNavigateToRecord}
            accessibilityRole="button"
          >
            <Text weight="semibold" className="text-base text-white">
              Record Debt
            </Text>
          </Pressable>
        </View>
      </View>

      <SlideUpModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter"
        headerBackgroundColor="#1643F5"
        headerTextColor="#FFFFFF"
        className="pb-6"
      >
        <View>
          <Text weight="semibold" className="text-sm text-textColor">
            Status
          </Text>
          <View style={styles.filterChipRow}>
            {STATUS_FILTERS.map((status) => {
              const isSelected = activeStatuses.has(status.key);
              return (
                <Pressable
                  key={status.key}
                  style={[
                    styles.filterChip,
                    isSelected
                      ? styles.filterChipActive
                      : styles.filterChipInactive,
                  ]}
                  onPress={() => handleToggleStatus(status.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    weight="semibold"
                    className="text-xs"
                    style={{
                      color: isSelected ? "#FFFFFF" : "#5B6473",
                    }}
                  >
                    {status.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6">
          <Text weight="semibold" className="text-sm text-textColor">
            Date Range
          </Text>
          <View style={styles.filterChipRow}>
            {DATE_FILTERS.map((filter) => {
              const isSelected = selectedDateFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    isSelected
                      ? styles.filterChipActive
                      : styles.filterChipInactive,
                  ]}
                  onPress={() => setSelectedDateFilter(filter.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    weight="semibold"
                    className="text-xs"
                    style={{
                      color: isSelected ? "#FFFFFF" : "#5B6473",
                    }}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.modalActions}>
          <Pressable
            style={styles.clearButton}
            onPress={resetFilters}
            accessibilityRole="button"
          >
            <Text weight="semibold" className="text-sm text-primary_400">
              Clear All
            </Text>
          </Pressable>
          <Pressable
            style={styles.applyButton}
            onPress={() => setShowFilterModal(false)}
            accessibilityRole="button"
          >
            <Text weight="semibold" className="text-sm text-white">
              Apply Filters
            </Text>
          </Pressable>
        </View>
      </SlideUpModal>
    </MainContainer>
  );
};

type SummaryCardProps = {
  label: string;
  amount: number;
  background: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  accentColor: string;
};

const SummaryCard = ({
  label,
  amount,
  background,
  icon,
  iconColor,
  accentColor,
}: SummaryCardProps) => {
  return (
    <View style={[styles.summaryCard, { backgroundColor: background }]}>
      <View className="flex-row px-4 py-2.5">
        <View>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text weight="semibold" className="text-sm text-textColor/60">
          {label}
        </Text>
      </View>
      <View className="px-4 py-3" style={{ backgroundColor: accentColor }}>
        <Text weight="bold" className="mt-1 text-lg text-white">
          {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },

  searchRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textColor,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: COLORS.grayLight,
  },
  tabRow: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: "#E9EDF5",
    borderRadius: 999,
    padding: 4,
    gap: 6,
  },
  tabChip: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  tabChipInactive: {
    backgroundColor: "transparent",
  },
  tabChipActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#1C274C",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  listContainer: {
    marginTop: 24,
    gap: 16,
  },
  debtCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  debtCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeRow: {
    marginTop: 6,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  amountRow: {
    marginTop: 14,
  },
  reminderButton: {
    marginTop: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary_400,
    padding: 10,
    alignItems: "center",
  },
  reminderButtonDisabled: {
    borderColor: "#D1D6DE",
    backgroundColor: "#F4F6F8",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: "rgba(250,250,250,0.95)",
  },
  recordButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  filterChipInactive: {
    backgroundColor: "#EEF2FD",
  },
  filterChipActive: {
    backgroundColor: COLORS.primary_400,
  },
  modalActions: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary_400,
    alignItems: "center",
    paddingVertical: 14,
  },
  applyButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: COLORS.primary_400,
    alignItems: "center",
    paddingVertical: 14,
  },
});

export default DebtTrackerScreen;

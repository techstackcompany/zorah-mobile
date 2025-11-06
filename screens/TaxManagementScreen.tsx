import MainContainer from "@/components/layouts/MainContainer";
import SlideUpModal from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  MOCK_TAX_RECORDS,
  TAX_DATE_RANGE_FILTERS,
  TAX_STATUS_META,
  TaxRecord,
  TaxStatus,
  formatCurrency,
} from "@/constants/tax";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

type DateRangeKey = (typeof TAX_DATE_RANGE_FILTERS)[number]["value"];

const ALL_STATUSES: TaxStatus[] = ["pending", "paid"];

const TaxManagementScreen = () => {
  const router = useRouter();
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>(MOCK_TAX_RECORDS);
  const [searchValue, setSearchValue] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState<Set<TaxStatus>>(
    () => new Set(ALL_STATUSES),
  );
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");

  const reminderState = useMemo(() => {
    return taxRecords.reduce<Record<string, boolean>>((acc, record) => {
      acc[record.id] = record.reminderEnabled;
      return acc;
    }, {});
  }, [taxRecords]);

  const summary = useMemo(() => {
    return taxRecords.reduce(
      (acc, record) => {
        if (record.status === "pending") {
          acc.due += record.taxDue;
        } else {
          acc.paid += record.taxDue;
        }
        return acc;
      },
      { due: 0, paid: 0 },
    );
  }, [taxRecords]);

  const nextDueRecord = useMemo(() => {
    const pendingRecords = taxRecords.filter((record) => {
      if (record.status !== "pending") {
        return false;
      }
      const due = new Date(record.dueDate);
      return !Number.isNaN(due.getTime());
    });
    pendingRecords.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
    return pendingRecords[0] ?? null;
  }, [taxRecords]);

  const filteredRecords = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    return taxRecords.filter((record) => {
      if (!activeStatuses.has(record.status)) {
        return false;
      }

      if (keyword.length > 0) {
        if (!record.name.toLowerCase().includes(keyword)) {
          return false;
        }
      }

      if (dateRange === "today") {
        const today = new Date().toDateString();
        return new Date(record.dueDate).toDateString() === today;
      }

      if (dateRange === "week") {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const dueDate = new Date(record.dueDate);
        return dueDate >= start && dueDate <= end;
      }

      if (dateRange === "lastWeek") {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const dueDate = new Date(record.dueDate);
        return dueDate >= start && dueDate <= end;
      }

      if (dateRange === "month") {
        const now = new Date();
        const dueDate = new Date(record.dueDate);
        return (
          dueDate.getMonth() === now.getMonth() &&
          dueDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateRange === "lastMonth") {
        const now = new Date();
        const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year =
          now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const dueDate = new Date(record.dueDate);
        return dueDate.getMonth() === month && dueDate.getFullYear() === year;
      }

      return true;
    });
  }, [taxRecords, activeStatuses, searchValue, dateRange]);

  const toggleStatusFilter = (status: TaxStatus) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      if (next.size === 0) {
        return new Set([status]);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setActiveStatuses(new Set(ALL_STATUSES));
    setDateRange("all");
  };

  const handleToggleReminder = (recordId: string, value: boolean) => {
    setTaxRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? { ...record, reminderEnabled: value }
          : record,
      ),
    );
  };

  const handleMarkAsPaid = (recordId: string) => {
    setTaxRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? { ...record, status: "paid", reminderEnabled: false }
          : record,
      ),
    );
  };

  const formattedNextDue = nextDueRecord
    ? `${new Date(nextDueRecord.dueDate).toLocaleDateString("en-NG", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    : null;

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(app)/more");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainContainer edges={["top"]} className="bg-lightMuted pb-0">
        <View style={styles.wrapper}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              onPress={handleBackPress}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.textColor} />
            </Pressable>
            <Text weight="semibold" className="text-lg text-textColor">
              Tax Management
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(app)/tax-management/add-record")}
              style={styles.addButton}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <LinearGradient
              colors={["#1A43BE", "#0F2F7C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <Text weight="semibold" className="text-base text-white">
                Tax Summary
              </Text>
              <View style={styles.summaryStatsRow}>
                <SummaryStat
                  label="Tax Due"
                  amount={summary.due}
                  variant="due"
                />
                <SummaryStat
                  label="Tax Paid"
                  amount={summary.paid}
                  variant="paid"
                />
              </View>
              {nextDueRecord && formattedNextDue ? (
                <View style={styles.nextDueRow}>
                  <Ionicons name="calendar" size={16} color="#FFFFFF" />
                  <View style={{ marginLeft: 8 }}>
                    <Text className="text-xs text-white/80">
                      Next due date ({nextDueRecord.name})
                    </Text>
                    <Text weight="semibold" className="text-sm text-white">
                      {formattedNextDue}
                    </Text>
                  </View>
                </View>
              ) : null}
            </LinearGradient>

            <View style={styles.searchRow}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={18} color="#8A94A6" />
                <TextInput
                  value={searchValue}
                  onChangeText={setSearchValue}
                  placeholder="Search tax name..."
                  placeholderTextColor="#8A94A6"
                  style={styles.searchInput}
                />
                <Pressable accessibilityRole="button" hitSlop={8}>
                  <Ionicons name="mic-outline" size={18} color="#8A94A6" />
                </Pressable>
              </View>
              <Pressable
                style={styles.filterButton}
                accessibilityRole="button"
                onPress={() => setFilterVisible(true)}
              >
                <Ionicons name="options-outline" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.listWrapper}>
              {filteredRecords.map((record) => (
                <TaxCard
                  key={record.id}
                  record={record}
                  reminderEnabled={reminderState[record.id]}
                  onToggleReminder={handleToggleReminder}
                  onOpenDetails={() =>
                    router.push({
                      pathname: "/(app)/tax-management/details",
                      params: { id: record.id },
                    })
                  }
                  onMarkAsPaid={handleMarkAsPaid}
                />
              ))}
              {filteredRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={28}
                    color="#9AA5B1"
                  />
                  <Text className="mt-3 text-sm text-textColor/60">
                    No tax records match your filters.
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <View style={styles.tipsIcon}>
                  <Ionicons name="bulb-outline" size={20} color="#2A3A50" />
                </View>
                <Text weight="semibold" className="text-base text-textColor">
                  Tax Management Tips
                </Text>
              </View>
              <View style={{ marginTop: 12, gap: 12 }}>
                <TipItem
                  title="Keep accurate records"
                  description="Maintain detailed records of your income and expenses to ensure you pay the correct amount of tax."
                />
                <TipItem
                  title="File taxes on time"
                  description="Avoid penalties by filing your taxes before the deadline."
                />
              </View>
            </View>
          </ScrollView>
        </View>

        <SlideUpModal
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          title="Filter"
          headerBackgroundColor={COLORS.primary_400}
          headerTextColor="#FFFFFF"
        >
          <View style={styles.filterSection}>
            <Text weight="semibold" className="text-sm text-textColor">
              Status
            </Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              <FilterCheckbox
                label="All Statuses"
                checked={activeStatuses.size === ALL_STATUSES.length}
                onToggle={() => setActiveStatuses(new Set(ALL_STATUSES))}
              />
              {ALL_STATUSES.map((status) => (
                <FilterCheckbox
                  key={status}
                  label={TAX_STATUS_META[status].label}
                  checked={activeStatuses.has(status)}
                  onToggle={() => toggleStatusFilter(status)}
                />
              ))}
            </View>
          </View>

          <View style={[styles.filterSection, { marginTop: 20 }]}>
            <Text weight="semibold" className="text-sm text-textColor">
              Date Range
            </Text>
            <View style={styles.dateFilterGrid}>
              {TAX_DATE_RANGE_FILTERS.map((option) => {
                const isActive = option.value === dateRange;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.dateFilterOption,
                      isActive ? styles.dateFilterOptionActive : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => setDateRange(option.value)}
                  >
                    <Text
                      weight="medium"
                      className={`text-xs ${isActive ? "text-white" : "text-textColor"}`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.filterActions}>
            <Pressable
              onPress={resetFilters}
              accessibilityRole="button"
              style={styles.clearButton}
            >
              <Text weight="semibold" className="text-sm text-primary_400">
                Clear All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilterVisible(false)}
              accessibilityRole="button"
              style={styles.applyButton}
            >
              <Text weight="semibold" className="text-sm text-white">
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </SlideUpModal>
      </MainContainer>
    </>
  );
};

type SummaryStatProps = {
  label: string;
  amount: number;
  variant: "due" | "paid";
};

const SummaryStat = ({ label, amount, variant }: SummaryStatProps) => {
  return (
    <View
      style={[
        styles.summaryStat,
        variant === "due" ? styles.summaryStatDue : styles.summaryStatPaid,
      ]}
    >
      <Text className="text-xs text-textColor/60">{label}</Text>
      <Text weight="bold" className="text-lg text-textColor">
        {formatCurrency(amount)}
      </Text>
    </View>
  );
};

const TipItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <View style={styles.tipRow}>
    <View style={styles.tipBullet} />
    <View style={{ flex: 1 }}>
      <Text weight="semibold" className="text-sm text-textColor">
        {title}
      </Text>
      <Text className="mt-1 text-xs text-textColor/70">{description}</Text>
    </View>
  </View>
);

type TaxCardProps = {
  record: TaxRecord;
  reminderEnabled: boolean;
  onToggleReminder: (id: string, value: boolean) => void;
  onOpenDetails: () => void;
  onMarkAsPaid: (id: string) => void;
};

const TaxCard = ({
  record,
  reminderEnabled,
  onToggleReminder,
  onOpenDetails,
  onMarkAsPaid,
}: TaxCardProps) => {
  const statusMeta = TAX_STATUS_META[record.status];
  const dueDateLabel = new Date(record.dueDate).toLocaleDateString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={styles.taxCard}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpenDetails}
        style={{ flex: 1 }}
      >
        <View style={styles.taxCardHeader}>
          <Text weight="semibold" className="text-base text-textColor">
            {record.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusMeta.background,
                borderColor: statusMeta.border,
              },
            ]}
          >
            <Text
              weight="semibold"
              style={{ color: statusMeta.textColor, fontSize: 12 }}
            >
              {statusMeta.label}
            </Text>
          </View>
        </View>
        <Text weight="bold" className="mt-2 text-2xl text-textColor">
          {formatCurrency(record.taxDue)}
        </Text>
        <View style={styles.dueRow}>
          <Ionicons name="calendar-outline" size={16} color="#8A94A6" />
          <Text className="ml-1 text-xs text-textColor/60">
            Due: {dueDateLabel}
          </Text>
        </View>
      </Pressable>

      <View style={styles.cardFooter}>
        <View style={styles.reminderRow}>
          <Text className="text-xs text-textColor/70">Reminder</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={(value) => onToggleReminder(record.id, value)}
            trackColor={{ false: "#D7DCE5", true: COLORS.primary_400 }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D7DCE5"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          style={[
            styles.cardActionButton,
            record.status === "paid"
              ? styles.cardActionButtonSuccess
              : styles.cardActionButtonPrimary,
          ]}
          onPress={
            record.status === "paid"
              ? onOpenDetails
              : () => onMarkAsPaid(record.id)
          }
        >
          <Text
            weight="semibold"
            className={`text-sm ${record.status === "paid" ? "text-secondary_500" : "text-white"}`}
          >
            {record.status === "paid" ? "Paid" : "Mark as Paid"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

type FilterCheckboxProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

const FilterCheckbox = ({ label, checked, onToggle }: FilterCheckboxProps) => {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ checked }}
      style={styles.filterCheckbox}
    >
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={20}
        color={checked ? COLORS.primary_400 : "#9AA5B1"}
      />
      <Text className="ml-3 text-sm text-textColor">{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary_400,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 20,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
  },
  summaryStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  summaryStat: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  summaryStatDue: {
    marginRight: 8,
  },
  summaryStatPaid: {
    marginLeft: 8,
  },
  nextDueRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textColor,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary_400,
  },
  listWrapper: {
    gap: 16,
  },
  taxCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  
  },
  taxCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  cardFooter: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardActionButton: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cardActionButtonPrimary: {
    backgroundColor: COLORS.primary_400,
  },
  cardActionButtonSuccess: {
    backgroundColor: COLORS.secondary_150,
  },
  tipsCard: {
    backgroundColor: "#E1F8EA",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: COLORS.primary_400,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },
  filterSection: {
    marginTop: 8,
  },
  filterCheckbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateFilterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
  },
  dateFilterOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#F2F4F8",
  },
  dateFilterOptionActive: {
    backgroundColor: COLORS.primary_400,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary_400,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: COLORS.primary_400,
  },
});

export default TaxManagementScreen;

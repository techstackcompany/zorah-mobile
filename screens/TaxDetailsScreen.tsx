import MainContainer from "@/components/layouts/MainContainer";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  MOCK_TAX_RECORDS,
  TAX_STATUS_META,
  TaxRecord,
  TaxStatus,
  formatCurrency,
} from "@/constants/tax";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatCompactDateTime = (value: string) =>
  new Date(value).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TaxDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const record = useMemo<TaxRecord>(
    () => MOCK_TAX_RECORDS.find((item) => item.id === params.id) ?? MOCK_TAX_RECORDS[0],
    [params.id],
  );

  const [status, setStatus] = useState<TaxStatus>(record.status);
  const [reminderEnabled, setReminderEnabled] = useState(record.reminderEnabled);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  const statusMeta = TAX_STATUS_META[status];

  const taxableIncome = Math.max(record.incomeAmount - record.deductions, 0);
  const summaryRows = [
    { label: "Gross Income", value: formatCurrency(record.incomeAmount) },
    { label: "Deductions", value: formatCurrency(record.deductions) },
    { label: "Taxable Income", value: formatCurrency(taxableIncome) },
    {
      label: "Tax (%)",
      value: `${(record.taxRate * 100).toFixed(0)}%`,
      valueStyle: { color: COLORS.textColor },
    },
    {
      label: "Total Tax Due",
      value: formatCurrency(record.taxDue),
      valueStyle: { color: "#D83A56" },
    },
  ];

  const handleMarkPaid = () => {
    if (status === "paid") {
      return;
    }
    setStatus("paid");
    setReminderEnabled(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainContainer edges={["top"]} className="bg-lightMuted">
        <View style={styles.headerRow}>
          <Pressable
            style={styles.headerButton}
            accessibilityRole="button"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.textColor} />
          </Pressable>
          <Text weight="semibold" className="text-lg text-textColor">
            Tax Details
          </Text>
          <View style={styles.headerButtonPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.primaryCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text weight="semibold" className="text-base text-textColor">
                  {record.name}
                </Text>
                <Text className="mt-1 text-xs text-textColor/60">
                  {record.country} • {record.incomeType[0].toUpperCase() + record.incomeType.slice(1)}
                </Text>
              </View>
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
                  style={{
                    color: statusMeta.textColor,
                    fontSize: 12,
                  }}
                >
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            <Text weight="bold" className="mt-4 text-3xl text-textColor">
              {formatCurrency(record.taxDue)}
            </Text>

            <View style={styles.dueRow}>
              <Ionicons name="calendar-outline" size={16} color="#8A94A6" />
              <Text className="ml-2 text-xs text-textColor/60">
                Due: {formatDateLabel(record.dueDate)}
              </Text>
            </View>

            <View style={styles.metaGrid}>
              <MetaItem label="Filing Date" value={formatDateLabel(record.filingDate)} />
              <MetaItem
                label="Frequency"
                value={record.frequency
                  .split("-")
                  .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
                  .join(" ")}
              />
              <MetaItem
                label="Income Amount"
                value={formatCurrency(record.incomeAmount)}
              />
              <MetaItem
                label="Deductible Expense"
                value={formatCurrency(record.deductions)}
              />
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.reminderRow}>
                <Text className="text-xs text-textColor/70">Reminder</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={(value) => {
                    setReminderEnabled(value);
                  }}
                  trackColor={{ true: COLORS.primary_400, false: "#D7DCE5" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D7DCE5"
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={handleMarkPaid}
                style={[
                  styles.markPaidButton,
                  status === "paid" ? styles.markPaidButtonCompleted : null,
                ]}
              >
                <Text
                  weight="semibold"
                  className={`text-sm ${status === "paid" ? "text-secondary_500" : "text-white"}`}
                >
                  {status === "paid" ? "Paid" : "Mark as Paid"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text weight="semibold" className="text-base text-textColor">
              Tax Details (Estimate)
            </Text>
            <View style={{ marginTop: 16, gap: 12 }}>
              {summaryRows.map((row) => (
                <View key={row.label} style={styles.summaryRow}>
                  <Text className="text-sm text-textColor/60">{row.label}</Text>
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

          <View style={styles.historyCard}>
            <Pressable
              style={styles.historyHeader}
              accessibilityRole="button"
              onPress={() => setHistoryExpanded((prev) => !prev)}
            >
              <Text weight="semibold" className="text-base text-textColor">
                Payment History
              </Text>
              <Ionicons
                name={historyExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={COLORS.textColor}
              />
            </Pressable>
            {historyExpanded ? (
              record.payments.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  {record.payments.map((payment, index) => (
                    <View
                      key={payment.id}
                      style={[
                        styles.historyRow,
                        index !== record.payments.length - 1
                          ? styles.historyRowDivider
                          : null,
                      ]}
                    >
                      <Text weight="semibold" className="text-sm text-textColor">
                        {formatCurrency(payment.amount)}
                      </Text>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text className="text-xs text-textColor/60">
                          {formatCompactDateTime(payment.timestamp)}
                        </Text>
                        <Text className="mt-1 text-xs text-textColor/50">
                          {payment.method}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyHistory}>
                  <Ionicons
                    name="card-outline"
                    size={22}
                    color="rgba(34,42,62,0.35)"
                  />
                  <Text className="mt-2 text-xs text-textColor/60">
                    No payment history yet.
                  </Text>
                </View>
              )
            ) : null}
          </View>
        </ScrollView>
      </MainContainer>
    </>
  );
};

const MetaItem = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flex: 1 }}>
    <Text className="text-xs text-textColor/50">{label}</Text>
    <Text weight="semibold" className="mt-1 text-sm text-textColor">
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerButton: {
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
  headerButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 20,
  },
  primaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 14,
    marginTop: 18,
  },
  cardFooter: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markPaidButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.primary_400,
  },
  markPaidButtonCompleted: {
    backgroundColor: COLORS.secondary_150,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#EEF1F6",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  historyRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F6",
  },
  emptyHistory: {
    marginTop: 18,
    alignItems: "center",
  },
});

export default TaxDetailsScreen;

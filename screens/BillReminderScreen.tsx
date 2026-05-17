import MainContainer from "@/components/layouts/MainContainer";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  cn,
  formatLongDate,
  formatNairaCurrency,
  generateColorsFromString,
} from "@/lib/utils";
import { useGetCategoriesQuery, useGetUserProfileQuery } from "@/src/api/hooks";
import {
  useGetBillsQuery,
  usePayBillMutation,
  useUpdateBillReminderMutation,
} from "@/src/api/hooks/useBillRemindersApi";
import { useUpdateProfileMutation } from "@/src/api/hooks/useAuthApi";
import { BillReminder } from "@/src/api/types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type FilterKey = "all" | "overdue" | "paid";

const BILL_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

const DEFAULT_BILL_ICON = require("@/assets/icons/bill-reminder.svg");

const normalizeCategoryLabel = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const buildImageSource = (source: unknown): ImageSource => {
  if (typeof source === "string") {
    const trimmed = source.trim();
    return trimmed ? { uri: trimmed } : DEFAULT_BILL_ICON;
  }

  if (source) {
    return source as ImageSource;
  }

  return DEFAULT_BILL_ICON;
};

const BillReminderScreen = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const {
    data: billsResponseData,
    error: billsError,
    isPending: isBillsPending,
    refetch: refetchBills,
  } = useGetBillsQuery();
  const {
    data: categoryData,
    error: categoryError,
    isPending: isCategoryPending,
    refetch: refetchCategories,
  } = useGetCategoriesQuery("budget");

  const formattedSummary = useMemo(() => {
    const summary = billsResponseData?.summary;
    return {
      totalMonthly: formatNairaCurrency(summary ? summary.totalMonthly : 0),
      totalDue: formatNairaCurrency(summary ? summary.totalDue : 0),
      totalPaid: formatNairaCurrency(summary ? summary.totalPaid : 0),
    };
  }, [billsResponseData]);

  const bills = useMemo(() => {
    if (!Array.isArray(billsResponseData?.bills)) return [];

    return billsResponseData.bills.map((bill) => ({
      ...bill,
      category: typeof bill.category === "string" ? bill.category : "",
      categoryImage:
        categoryData?.find(
          (category) =>
            normalizeCategoryLabel(category.label) ===
            normalizeCategoryLabel(bill.category),
        )?.icon ?? null,
    }));
  }, [billsResponseData, categoryData]);

  const overdueBills = bills.filter((bill) => bill.status === "overdue");

  const filteredBills = useMemo(() => {
    if (activeFilter === "all") {
      return bills;
    }
    if (activeFilter === "overdue") {
      return bills.filter((bill) => bill.status === "overdue");
    }
    return bills.filter((bill) => bill.status === "paid");
  }, [activeFilter, bills]);

  const handleAddBill = () => {
    router.push("/(app)/bill-reminder/add-bill");
  };

  const sectionTitle = activeFilter === "all" ? "All Bills" : "My Bills";
  const totalBillsLabel = `${filteredBills.length} Bills`;

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
              hitSlop={5}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <Image
                source={require("@/assets/icons/add-budget.svg")}
                style={{ width: 24, height: 24 }}
                tintColor={COLORS.primary_400}
              />
            </Pressable>
          ),
        }}
      />
      <MainContainer edges={[]} className="bg-lightMuted">
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View className="gap-5">
              <View>
                <Text className="text-xs uppercase text-textColor/60">
                  Monthly Bills
                </Text>
                <Text weight="bold" className="mt-2 text-4xl text-textColor">
                  {formattedSummary.totalMonthly}
                </Text>
              </View>

              <View style={styles.summaryBreakdown}>
                <View style={styles.summaryBreakdownItem}>
                  <View style={styles.summaryBadgeHeader}>
                    <Text className="text-xs text-textColor/70">Paid</Text>
                  </View>
                  <Text weight="bold" className="text-base text-secondary_500">
                    {formattedSummary.totalPaid}
                  </Text>
                </View>
                <View style={styles.summaryBreakdownItem}>
                  <View style={styles.summaryBadgeHeader}>
                    <Text className="text-xs text-textColor/70">Due</Text>
                  </View>
                  <Text weight="bold" className="text-base text-[#EB5757]">
                    {formattedSummary.totalDue}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <ReminderTimeSetting />

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

          {overdueBills.length > 0 && activeFilter !== "paid" ? (
            <Pressable
              style={styles.overdueNotice}
              onPress={() => setActiveFilter("overdue")}
            >
              <View>
                <MaterialIcons
                  name="error-outline"
                  size={24}
                  color={COLORS.error}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text weight="bold" className="text-sm text-darkRed">
                  Overdue Bill
                </Text>
                <Text className="mt-1 text-xs text-error">
                  You have {overdueBills.length} overdue bill
                  {overdueBills.length > 1 ? "s" : ""} totaling{" "}
                  {formattedSummary.totalDue}
                </Text>
              </View>
            </Pressable>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text weight="semibold" className="text-base text-textColor">
              {sectionTitle}
            </Text>
            <Text className="text-xs text-primary_400">{totalBillsLabel}</Text>
          </View>

          {isBillsPending || isCategoryPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary_400} />
              <Text className="mt-4 text-sm text-textColor/60">
                Loading bills...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredBills}
              renderItem={({ item }) => <BillReminderCard bill={item} />}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.billList}
              scrollEnabled={false}
              ListEmptyComponent={
                filteredBills.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text
                      weight="semibold"
                      className="text-base text-textColor"
                    >
                      No bills found
                    </Text>
                    <Text className="mt-2 text-center text-sm text-textColor/60">
                      Add a new bill{" "}
                      {activeFilter !== "all" &&
                        "or adjust your filter to see reminders."}
                    </Text>
                    <Button
                      title="Add Bill"
                      className="mt-5"
                      onPress={handleAddBill}
                    />
                  </View>
                ) : null
              }
            />
          )}

          {(categoryError || billsError) && (
            <View style={styles.errorContainer}>
              <MaterialIcons
                name="error-outline"
                size={48}
                color={COLORS.error}
              />
              <Text weight="semibold" className="mt-4 text-base text-textColor">
                Unable to Load Bills
              </Text>
              <Text className="mt-2 text-center text-sm text-textColor/60">
                {billsError?.message ||
                  categoryError?.message ||
                  "Something went wrong. Please try again."}
              </Text>
              <Button
                title="Retry"
                className="mt-5"
                onPress={() => {
                  refetchBills();
                  refetchCategories();
                }}
              />
            </View>
          )}
        </ScrollView>
      </MainContainer>
    </>
  );
};

interface BillCardProps {
  bill: BillReminder & { categoryImage: unknown };
}

const BillReminderCard = ({ bill }: BillCardProps) => {
  const [isEnabled, setIsEnabled] = useState(bill.reminderEnabled);
  const { mutate, isPending: isSubmitting } = usePayBillMutation(bill._id);
  const { mutate: updateBill } = useUpdateBillReminderMutation(bill._id);
  const handleToggleReminder = (id: string, value: boolean) => {
    setIsEnabled(value);
    updateBill({ reminderEnabled: value });
  };
  const queryClient = useQueryClient();
  const handleMarkAsPaid = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["billReminders"] });
        Toast.show({ text1: data.message });
      },
    });
  };
  const categoryMeta = generateColorsFromString(bill.category);
  return (
    <View key={bill._id} style={styles.billCard}>
      <View style={styles.billCardHeader}>
        <View
          style={[
            styles.billIconBackground,
            {
              backgroundColor: categoryMeta.background,
            },
          ]}
        >
          <Image
            source={buildImageSource(bill.categoryImage)}
            style={{ width: 20, height: 20 }}
            tintColor={categoryMeta.accent}
            contentFit="contain"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text weight="semibold" className="text-base text-textColor">
            {bill.name}
          </Text>
          <Text className="mt-1 text-xs text-textColor/60">
            Due: {formatLongDate(bill.dueDate)}
          </Text>
        </View>
        <Pressable className="flex-row items-center">
          <Text className="text-xs text-textColor/60">Reminder</Text>
          <Switch
            value={isEnabled}
            onValueChange={(value) => handleToggleReminder(bill._id, value)}
            trackColor={{
              false: COLORS.grey,
              true: COLORS.secondary_400,
            }}
            thumbColor={COLORS.white}
            ios_backgroundColor="#D7DCE5"
            style={{ transform: [{ scale: 0.9 }] }}
          />
        </Pressable>
      </View>

      <View style={styles.billCardFooter}>
        <Text weight="bold" className="text-lg text-textColor">
          {formatNairaCurrency(bill.amount)}
        </Text>
        {bill.status === "paid" ? (
          <View style={styles.paidBadge}>
            <Ionicons name="checkmark" size={16} color={COLORS.secondary_500} />
            <Text weight="semibold" className="ml-2 text-sm text-secondary_500">
              Paid
            </Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleMarkAsPaid}
            style={styles.markAsPaidButton}
          >
            <View className="absolute w-full items-center justify-center">
              {isSubmitting && <ActivityIndicator color={COLORS.primary_400} />}
            </View>
            <Text
              weight="semibold"
              className={cn(
                "text-sm text-primary_400",
                isSubmitting && "opacity-0",
              )}
            >
              Mark as Paid
            </Text>
          </Pressable>
        )}
      </View>
    </View>
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
    borderRadius: 8,
    backgroundColor: "#E5ECFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  summaryBreakdown: {
    gap: 12,
    alignItems: "flex-end",
    flexDirection: "row",
  },
  summaryBreakdownItem: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 132,
    gap: 4,
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
  },
  overdueNotice: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
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
    backgroundColor: COLORS.secondary_100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.secondary_500,
  },
  markAsPaidButton: {
    backgroundColor: COLORS.primary_200,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary_400,
  },
  emptyState: {
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  loadingContainer: {
    marginTop: 32,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error + "20",
  },
});

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const formatHourLabel = (hour: number) =>
  `${hour.toString().padStart(2, "0")}:00`;

const ReminderTimeSetting = () => {
  const { data: userData } = useGetUserProfileQuery();
  const safeUser = (userData ?? {}) as Record<string, any>;
  const initialHour =
    typeof safeUser.preferredReminderHour === "number"
      ? safeUser.preferredReminderHour
      : 9;

  const [selectedHour, setSelectedHour] = useState<number>(initialHour);
  const [showPicker, setShowPicker] = useState(false);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();

  const handleSave = async (hour: number) => {
    try {
      await updateProfile({ preferredReminderHour: hour });
      setShowPicker(false);
      Toast.show({
        type: "success",
        text1: "Saved",
        text2: "Reminder time updated.",
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e?.response?.data?.message || "Failed to update reminder time.",
      });
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text weight="semibold" className="text-base text-textColor">
            Daily Reminder Time
          </Text>
          <Text className="text-xs text-textColor/60 mt-1">
            Receive alerts at {formatHourLabel(selectedHour)}
          </Text>
        </View>

        <Pressable onPress={() => setShowPicker((prev) => !prev)}>
          <Text className="text-sm text-primary_400" weight="semibold">
            {showPicker ? "Done" : "Change"}
          </Text>
        </Pressable>
      </View>

      {showPicker && (
        <View style={{ marginTop: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {HOURS.map((hour) => {
              const isActive = hour === selectedHour;
              return (
                <Pressable
                  key={hour}
                  onPress={() => {
                    setSelectedHour(hour);
                    handleSave(hour);
                  }}
                  disabled={isPending}
                  style={{
                    minWidth: 64,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isActive ? COLORS.primary_400 : "#E3E7EF",
                    backgroundColor: isActive ? COLORS.primary_400 : "#FFFFFF",
                    alignItems: "center",
                  }}
                >
                  <Text
                    weight="semibold"
                    className={
                      isActive ? "text-sm text-white" : "text-sm text-textColor"
                    }
                  >
                    {formatHourLabel(hour)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {isPending && (
            <View style={{ marginTop: 10, alignItems: "center" }}>
              <ActivityIndicator size="small" color={COLORS.primary_400} />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default BillReminderScreen;

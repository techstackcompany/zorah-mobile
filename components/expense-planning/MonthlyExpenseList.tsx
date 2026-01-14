import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { MonthlyExpenseTotal } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type MonthlyExpenseListProps = {
  monthlyExpenses: MonthlyExpenseTotal[];
  isLoading?: boolean;
  formatCurrency: (value: number) => string;
  formatDate?: (month: number, year: number) => string;
};

const formatMonthlyDate = (month: number, year: number): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  
  if (month === currentMonth && year === currentYear) {
    return `This Month (${monthNames[month - 1]})`;
  }

  
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  if (month === lastMonth && year === lastMonthYear) {
    return `Last Month (${monthNames[month - 1]})`;
  }

  return `${monthNames[month - 1]} ${year}`;
};

const MonthlyExpenseList = ({
  monthlyExpenses,
  isLoading = false,
  formatCurrency,
  formatDate = formatMonthlyDate,
}: MonthlyExpenseListProps) => {
  const transformedData = useMemo(() => {
    if (!monthlyExpenses || monthlyExpenses.length === 0) return [];

    
    return [...monthlyExpenses]
      .sort((a, b) => {
        const dateA = new Date(a._id.year, a._id.month - 1, 1);
        const dateB = new Date(b._id.year, b._id.month - 1, 1);
        return dateB.getTime() - dateA.getTime();
      })
      .map((item) => ({
        ...item,
        formattedDate: formatDate(item._id.month, item._id.year),
      }));
  }, [monthlyExpenses, formatDate]);

  if (isLoading) {
    return (
      <View className="gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className="flex-row items-center gap-4">
            <View style={styles.skeletonIcon} />
            <View className="flex-1 gap-2">
              <View style={styles.skeletonLinePrimary} />
              <View style={styles.skeletonLineSecondary} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (!transformedData.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="calendar-outline"
          size={32}
          color={COLORS.textColor}
          style={{ opacity: 0.4 }}
        />
        <Text className="mt-3 text-sm text-textColor/60">
          No monthly expense data available.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {transformedData.map((item, index, array) => {
        const isLast = index === array.length - 1;
        const isCurrentMonth = item.formattedDate.includes("This Month");
        const isLastMonth = item.formattedDate.includes("Last Month");

        return (
          <View
            key={`${item._id.year}-${item._id.month}`}
            className={`flex-row items-center gap-4 ${isLast ? "" : "border-b border-grayLight/60 pb-3"}`}
          >
            <View
              style={[
                styles.dateIcon,
                {
                  backgroundColor: isCurrentMonth
                    ? COLORS.primary_200
                    : isLastMonth
                      ? COLORS.lightBg
                      : "#F6F5FF",
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  isCurrentMonth
                    ? COLORS.primary_400
                    : isLastMonth
                      ? COLORS.textColor
                      : COLORS.primary_400
                }
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  weight={isCurrentMonth || isLastMonth ? "semibold" : "medium"}
                  className={`text-sm ${isCurrentMonth ? "text-primary_400" : "text-textColor"}`}
                >
                  {item.formattedDate}
                </Text>
                <Text weight="bold" className="text-sm text-textColor">
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
  },
  skeletonLinePrimary: {
    height: 8,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    width: "90%",
  },
  skeletonLineSecondary: {
    height: 7,
    borderRadius: 12,
    backgroundColor: "#E9EDF5",
    width: "60%",
  },
});

export default MonthlyExpenseList;

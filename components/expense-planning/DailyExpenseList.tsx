import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { DailyExpenseTotal } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type DailyExpenseListProps = {
  dailyExpenses: DailyExpenseTotal[];
  isLoading?: boolean;
  formatCurrency: (value: number) => string;
  formatDate?: (day: number, month: number, year: number) => string;
};

const formatDailyDate = (day: number, month: number, year: number): string => {
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[month - 1];

  if (date.getFullYear() === today.getFullYear()) {
    return `${dayName}, ${monthName} ${day}`;
  }

  return `${dayName}, ${monthName} ${day}, ${year}`;
};

const DailyExpenseList = ({
  dailyExpenses,
  isLoading = false,
  formatCurrency,
  formatDate = formatDailyDate,
}: DailyExpenseListProps) => {
  const transformedData = useMemo(() => {
    if (!dailyExpenses || dailyExpenses.length === 0) return [];

    
    return [...dailyExpenses]
      .sort((a, b) => {
        const dateA = new Date(a._id.year, a._id.month - 1, a._id.day);
        const dateB = new Date(b._id.year, b._id.month - 1, b._id.day);
        return dateB.getTime() - dateA.getTime();
      })
      .map((item) => ({
        ...item,
        date: new Date(item._id.year, item._id.month - 1, item._id.day),
        formattedDate: formatDate(item._id.day, item._id.month, item._id.year),
      }));
  }, [dailyExpenses, formatDate]);

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
          No daily expense data available.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {transformedData.map((item, index, array) => {
        const isLast = index === array.length - 1;
        const isToday = item.formattedDate === "Today";
        const isYesterday = item.formattedDate === "Yesterday";

        return (
          <View
            key={`${item._id.year}-${item._id.month}-${item._id.day}`}
            className={`flex-row items-center gap-4 ${isLast ? "" : "border-b border-grayLight/60 pb-3"}`}
          >
            <View
              style={[
                styles.dateIcon,
                {
                  backgroundColor: isToday
                    ? COLORS.primary_200
                    : isYesterday
                      ? COLORS.lightBg
                      : "#F6F5FF",
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  isToday
                    ? COLORS.primary_400
                    : isYesterday
                      ? COLORS.textColor
                      : COLORS.primary_400
                }
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  weight={isToday || isYesterday ? "semibold" : "medium"}
                  className={`text-sm ${isToday ? "text-primary_400" : "text-textColor"}`}
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

export default DailyExpenseList;


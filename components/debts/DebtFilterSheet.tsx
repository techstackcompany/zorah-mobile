import SlideUpModal, {
  SlideUpModalRef,
} from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  DebtDateRangeFilter,
  DebtFilters,
  DebtStatusFilter,
} from "@/features/debts/types";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, View } from "react-native";

type Props = {
  onApply: (filters: DebtFilters) => void;
};

const STATUS_OPTIONS: { id: DebtStatusFilter; label: string }[] = [
  { id: "all", label: "All Statuses" },
  { id: "outstanding", label: "Outstanding" },
  { id: "settled", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

const DATE_OPTIONS: { id: DebtDateRangeFilter; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "this-week", label: "This week" },
  { id: "last-week", label: "Last Week" },
  { id: "this-month", label: "This Month" },
  { id: "last-month", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

export type DebtFilterSheetRef = {
  present: () => void;
  dismiss: () => void;
};

const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      "mb-2 mr-2 flex-row items-center rounded-full border px-3 py-1.5",
      selected ? "border-primary_400 bg-primary_100" : "border-gray-200 bg-white",
    )}
  >
    {selected && (
      <Ionicons
        name="checkmark"
        size={13}
        color={COLORS.primary_400}
        style={{ marginRight: 4 }}
      />
    )}
    <Text
      family="nunito"
      weight={selected ? "semibold" : "medium"}
      className={cn("text-sm", selected ? "text-primary_400" : "text-textColor")}
    >
      {label}
    </Text>
  </Pressable>
);

export const DebtFilterSheet = forwardRef<DebtFilterSheetRef, Props>(
  ({ onApply }, ref) => {
    const modalRef = useRef<SlideUpModalRef>(null);
    const [pendingStatus, setPendingStatus] = useState<DebtStatusFilter>("all");
    const [pendingDate, setPendingDate] = useState<DebtDateRangeFilter>("all");

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const handleClear = () => {
      setPendingStatus("all");
      setPendingDate("all");
    };

    const handleApply = () => {
      onApply({ status: pendingStatus, dateRange: pendingDate });
      modalRef.current?.dismiss();
    };

    return (
      <SlideUpModal
        ref={modalRef}
        title="Filter"
        headerBackgroundColor={COLORS.primary_400}
        headerTextColor="#FFFFFF"
        closeIconColor="#FFFFFF"
        enableDynamicSizing
      >
        {/* Status section */}
        <View className="mb-4">
          <Text
            family="nunito"
            weight="semibold"
            className="mb-2 text-sm text-textColor"
          >
            Status
          </Text>
          <View className="flex-row flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.id}
                label={opt.label}
                selected={pendingStatus === opt.id}
                onPress={() => setPendingStatus(opt.id)}
              />
            ))}
          </View>
        </View>

        {/* Date Range section */}
        <View className="mb-6">
          <Text
            family="nunito"
            weight="semibold"
            className="mb-2 text-sm text-textColor"
          >
            Date Range
          </Text>
          <View className="flex-row flex-wrap">
            {DATE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.id}
                label={opt.label}
                selected={pendingDate === opt.id}
                onPress={() => {
                  if (opt.id === "custom") {
                    // TODO: custom date range picker
                  }
                  setPendingDate(opt.id);
                }}
              />
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleClear}
            className="flex-1 items-center justify-center rounded-xl border border-primary_400 py-3.5 active:bg-primary_100"
          >
            <Text
              family="nunito"
              weight="semibold"
              className="text-sm text-primary_400"
            >
              Clear All
            </Text>
          </Pressable>
          <Pressable
            onPress={handleApply}
            className="flex-1 items-center justify-center rounded-xl bg-primary_400 py-3.5 active:opacity-90"
          >
            <Text
              family="nunito"
              weight="semibold"
              className="text-sm text-white"
            >
              Apply Filters
            </Text>
          </Pressable>
        </View>
      </SlideUpModal>
    );
  },
);

DebtFilterSheet.displayName = "DebtFilterSheet";

import SegmentedControl from "@/components/SegmentedControl";
import { DebtCard } from "@/components/debts/DebtCard";
import { DebtEmptyState } from "@/components/debts/DebtEmptyState";
import {
  DebtFilterSheet,
  DebtFilterSheetRef,
} from "@/components/debts/DebtFilterSheet";
import { DebtSearchBar } from "@/components/debts/DebtSearchBar";
import { DebtSummaryCards } from "@/components/debts/DebtSummaryCards";
import MainContainer from "@/components/layouts/MainContainer";
import { MOCK_DEBTS } from "@/features/debts/mockData";
import { DebtFilters, DebtRecord, DebtTabId } from "@/features/debts/types";
import { applyAllFilters, computeTotals } from "@/features/debts/utils";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

const SEGMENTS: { key: DebtTabId; label: string }[] = [
  { key: "all", label: "All" },
  { key: "borrowed", label: "Borrowed" },
  { key: "lent", label: "Lent" },
];

const DEFAULT_FILTERS: DebtFilters = {
  status: "all",
  dateRange: "all",
};

const DebtTrackerScreen = () => {
  const router = useRouter();
  const filterSheetRef = useRef<DebtFilterSheetRef>(null);

  const [activeTab, setActiveTab] = useState<DebtTabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<DebtFilters>(DEFAULT_FILTERS);

  const totals = useMemo(() => computeTotals(MOCK_DEBTS), []);

  const filteredDebts = useMemo(
    () => applyAllFilters(MOCK_DEBTS, activeTab, searchQuery, appliedFilters),
    [activeTab, searchQuery, appliedFilters],
  );

  const handleCardPress = (debt: DebtRecord) => {
    router.push({ pathname: "/(app)/debts/details", params: { id: debt.id } });
  };

  const handleSendReminder = (debt: DebtRecord) => {
    // TODO: wire to API
    Toast.show({
      type: "success",
      text1: "Reminder Sent",
      text2: `Reminder sent to ${debt.counterpartyName}`,
    });
  };

  const handleMicPress = () => {
    // TODO: wire voice search using hooks/useVoiceTranscriber.ts
  };

  return (
    <MainContainer edges={["bottom"]} className="bg-[#F8F9FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Summary Cards */}
        <DebtSummaryCards
          totalBorrowed={totals.totalBorrowed}
          totalLent={totals.totalLent}
        />

        {/* Search Bar */}
        <DebtSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onMicPress={handleMicPress}
          onFilterPress={() => filterSheetRef.current?.present()}
        />

        {/* Tabs */}
        <View className="mb-4">
          <SegmentedControl
            segments={SEGMENTS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as DebtTabId)}
          />
        </View>

        {/* Debt List */}
        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {filteredDebts.length === 0 ? (
            <DebtEmptyState />
          ) : (
            filteredDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onPress={handleCardPress}
                onSendReminder={handleSendReminder}
              />
            ))
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Floating + button */}
      <Pressable
        onPress={() => router.push("/(app)/debts/record")}
        className="absolute bottom-8 right-5 h-14 w-14 items-center justify-center rounded-full bg-primary_400 shadow-lg active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="Record new debt"
        style={{
          shadowColor: COLORS.primary_400,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {/* Filter Sheet */}
      <DebtFilterSheet
        ref={filterSheetRef}
        onApply={(filters) => setAppliedFilters(filters)}
      />
    </MainContainer>
  );
};

export default DebtTrackerScreen;

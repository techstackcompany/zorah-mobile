import { EsusuActionBanner } from "@/components/esusu/EsusuActionBanner";
import { EsusuEmptyState } from "@/components/esusu/EsusuEmptyState";
import { EsusuFilterTabs } from "@/components/esusu/EsusuFilterTabs";
import { EsusuGroupActionSheet } from "@/components/esusu/EsusuGroupActionSheet";
import { EsusuGroupCard } from "@/components/esusu/EsusuGroupCard";
import { EsusuSearchBar } from "@/components/esusu/EsusuSearchBar";
import { EsusuSummaryCard } from "@/components/esusu/EsusuSummaryCard";
import MainContainer from "@/components/layouts/MainContainer";
import { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import { MOCK_ESUSU_SUMMARY, SAMPLE_ESUSU_GROUPS } from "@/features/esusu/mockData";
import { EsusuTabId } from "@/features/esusu/types";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

const EsusuScreen = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<EsusuTabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups] = useState(SAMPLE_ESUSU_GROUPS);
  const actionSheetRef = useRef<SlideUpModalRef>(null);

  const activeGroupCount = useMemo(() => {
    if (groups.length === 0) return MOCK_ESUSU_SUMMARY.activeGroupCount;
    return groups.filter((g) => g.status === "active").length;
  }, [groups]);

  const totalContribution = useMemo(() => {
    if (groups.length === 0) return MOCK_ESUSU_SUMMARY.totalContribution;
    return groups.reduce((acc, curr) => acc + curr.contributionAmount, 0);
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesTab =
        selectedTab === "all" ? true : group.status === selectedTab;
      const matchesSearch = searchQuery.trim()
        ? group.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        : true;
      return matchesTab && matchesSearch;
    });
  }, [groups, selectedTab, searchQuery]);

  const handleCreateNewGroup = () => {
    router.push("/(app)/esusu/create");
  };

  const handlePressMore = () => {
    // TODO: pass the selected group's id through once actions are wired to the API
    actionSheetRef.current?.present();
  };

  return (
    <MainContainer edges={["bottom"]} className="bg-[#F8F9FA] pb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        <EsusuSummaryCard
          totalContribution={totalContribution}
          activeGroupCount={activeGroupCount}
          growthPercentage={MOCK_ESUSU_SUMMARY.growthPercentage}
        />

        <EsusuActionBanner onCreatePress={handleCreateNewGroup} />

        <EsusuFilterTabs
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        <EsusuSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredGroups.length === 0 ? (
          <EsusuEmptyState
            title={searchQuery.trim() ? "No matching groups" : "No group savings"}
            subtitle={
              searchQuery.trim()
                ? "Try searching with another keyword"
                : "All group savings will appear here"
            }
          />
        ) : (
          <View className="mt-4">
            {filteredGroups.map((group) => (
              <EsusuGroupCard
                key={group.id}
                group={group}
                onPressMore={handlePressMore}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <EsusuGroupActionSheet
        ref={actionSheetRef}
        onAdjustContribution={() => {
          // TODO: wire to API
          actionSheetRef.current?.dismiss();
        }}
        onRescheduleCycle={() => {
          // TODO: wire to API
          actionSheetRef.current?.dismiss();
        }}
        onAddRemoveMembers={() => {
          // TODO: wire to API
          actionSheetRef.current?.dismiss();
        }}
        onViewGroup={() => {
          // TODO: wire to API / navigation
          actionSheetRef.current?.dismiss();
        }}
        onTrackPayment={() => {
          // TODO: wire to API
          actionSheetRef.current?.dismiss();
        }}
        onInviteMembers={() => {
          // TODO: wire to API
          actionSheetRef.current?.dismiss();
        }}
        onFreezeCloseGroup={() => {
          // TODO: wire to API
          actionSheetRef.current?.dismiss();
        }}
      />
    </MainContainer>
  );
};

export default EsusuScreen;

import EmptyStateCard from "@/components/esusu/EmptyStateCard";
import FilterTabs, { type FilterTab } from "@/components/esusu/FilterTabs";
import GroupSavingsCard from "@/components/esusu/GroupSavingsCard";
import SearchBar from "@/components/esusu/SearchBar";
import TotalContributionCard from "@/components/esusu/TotalContributionCard";
import COLORS from "@/constants/colors";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

const filterTabs: FilterTab[] = [
  { label: "All", icon: "apps" },
  { label: "Active", icon: "person-outline" },
  { label: "Pending", icon: "time-outline" },
  { label: "Completed", icon: "checkmark-circle-outline" },
];

export default function EsusuDashboardScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [trend] = useState<"up" | "down" | "neutral">("neutral");
  const trendPercentage = 0;
  const headerHeight = useHeaderHeight();

  const handleCreateGroup = () => {
    router.push("/esusu/create-group");
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight + 10}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 100,
            backgroundColor: COLORS.lightMuted,
          }}
        >
          <View className="flex-row flex-wrap justify-center gap-8">
            <View style={{ flex: 1 }} className="">
              <TotalContributionCard
                totalAmount="₦0.00"
                activeGroups={0}
                trend={trend}
                trendPercentage={trendPercentage}
              />

              <GroupSavingsCard onCreateGroup={handleCreateGroup} />

              <FilterTabs
                tabs={filterTabs}
                selectedIndex={selectedTab}
                onSelect={setSelectedTab}
              />

              <SearchBar value={search} onChangeText={setSearch} />

              <EmptyStateCard />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

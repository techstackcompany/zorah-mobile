import { ScalePressable } from "@/components/ui/ScalePressable";
import Text from "@/components/ui/Text";
import { EsusuTabId, EsusuTabItem } from "@/features/esusu/types";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, View } from "react-native";

interface EsusuFilterTabsProps {
  selectedTab: EsusuTabId;
  onSelectTab: (tabId: EsusuTabId) => void;
}

const TABS: EsusuTabItem[] = [
  {
    id: "all",
    label: "All",
    icon: require("@/assets/icons/esusu/all.svg"),
  },
  {
    id: "active",
    label: "Active",
    icon: require("@/assets/icons/esusu/active.svg"),
  },
  {
    id: "pending",
    label: "Pending",
    icon: require("@/assets/icons/esusu/pending.svg"),
  },
  {
    id: "completed",
    label: "Completed",
    icon: require("@/assets/icons/esusu/completed.svg"),
  },
];

export const EsusuFilterTabs = ({
  selectedTab,
  onSelectTab,
}: EsusuFilterTabsProps) => {
  return (
    <View className="mt-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <ScalePressable
              key={tab.id}
              scaleTo={0.96}
              onPress={() => onSelectTab(tab.id)}
              className={cn(
                "flex-row items-center justify-center rounded-xl px-3 py-2.5",
                isActive
                  ? "bg-primary_400"
                  : "bg-white",
              )}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} tab`}
            >
              <Image
                source={tab.icon}
                style={{ width: 16, height: 16 }}
                contentFit="contain"
                tintColor={isActive ? "#FFFFFF" : "#848484"}
              />
              <Text
                family="nunito"
                weight={isActive ? "semibold" : "medium"}
                className={cn(
                  "ml-1.5 text-sm",
                  isActive ? "text-white" : "text-[#848484]",
                )}
              >
                {tab.label}
              </Text>
            </ScalePressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

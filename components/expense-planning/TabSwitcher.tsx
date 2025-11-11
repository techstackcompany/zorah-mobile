import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type TabKey = "expense" | "income";

export type TabItem = {
  key: TabKey;
  label: string;
};

type TabSwitcherProps = {
  tabs: readonly TabItem[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

const TabSwitcher = ({ tabs, activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <View style={styles.segmentWrapper}>
      {tabs.map((item) => {
        const isActive = item.key === activeTab;
        return (
          <Pressable
            key={item.key}
            onPress={() => onTabChange(item.key)}
            style={[
              styles.segmentButton,
              isActive && styles.segmentButtonActive,
            ]}
            className={cn(
              "flex-1 items-center justify-center rounded-full py-3",
              isActive ? "bg-white" : undefined,
            )}
          >
            <Text
              weight={isActive ? "semibold" : "medium"}
              className={cn(
                "text-base",
                isActive ? "text-textColor" : "text-textColor/60",
              )}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  segmentWrapper: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: COLORS.lightBg,
    borderRadius: 32,
    padding: 4,
  },
  segmentButton: {
    borderRadius: 28,
  },
  segmentButtonActive: {
    shadowColor: "#182542",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
});

export default TabSwitcher;

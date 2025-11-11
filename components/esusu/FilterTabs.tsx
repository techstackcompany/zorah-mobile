import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type FilterTab = {
  label: string;
  icon: IoniconName;
};

type FilterTabsProps = {
  tabs: FilterTab[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function FilterTabs({
  tabs,
  selectedIndex,
  onSelect,
}: FilterTabsProps) {
  return (
    <View className="mt-5 flex-row flex-wrap items-center justify-between gap-1">
      {tabs.map((tab, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={tab.label}
            onPress={() => onSelect(index)}
            className={cn(
              "flex-row items-center gap-2 rounded-md px-3 py-3",
              isSelected ? "bg-[#1A43BE]" : "bg-white",
            )}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={isSelected ? "white" : "#5F6379"}
            />
            <Text
              className={cn(
                "text-xs",
                isSelected ? "text-white" : "text-textColor/60",
              )}
              weight={isSelected ? "semibold" : "medium"}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

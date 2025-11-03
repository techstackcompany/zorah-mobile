import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type GridItem = {
  id: string;
  label: string;
  change: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  tint: string;
};

type Props = {
  items: GridItem[];
};

const MostSpendingGrid: React.FC<Props> = ({ items }) => {
  return (
    <View className="mt-5 flex-row flex-wrap justify-between">
      {items.map((item) => (
        <View
          key={item.id}
          className="mb-4 w-[48%] rounded-3xl px-4 pb-4 pt-5"
          style={{
            backgroundColor: item.tint,
          }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <View className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${item.accent}1A` }}
            >
              <Ionicons name={item.icon} size={22} color={item.accent} />
            </View>
            <Text className="text-base text-[#1C1C1E]" family="nunito" weight="semibold">
              {item.change}
            </Text>
          </View>
          <Text className="text-sm text-[#1C1C1E]" family="nunito" weight="semibold">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default MostSpendingGrid;

import Text from "@/components/ui/Text";
import React from "react";
import { View } from "react-native";

type BreakdownStatus = {
  label: string;
  textColor: string;
  background: string;
};

type BreakdownItem = {
  id: string;
  label: string;
  usage: string;
  spent: string;
  budget: string;
  status: BreakdownStatus;
};

type Props = {
  items: BreakdownItem[];
};

const SpendingBreakdown: React.FC<Props> = ({ items }) => {
  return (
    <View className="mt-5 space-y-4">
      {items.map((item) => (
        <View
          key={item.id}
          className="rounded-3xl bg-white px-5 py-4"
          style={{
            shadowColor: "#101828",
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <View className="mb-2 flex-row items-center justify-between">
            <Text family="nunito" weight="semibold" className="text-base text-tertiary">
              {item.label}
            </Text>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: item.status.background }}
            >
              <Text
                family="nunito"
                weight="semibold"
                className="text-xs"
                style={{ color: item.status.textColor }}
              >
                {item.status.label}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-[#8F95A3]">{item.usage}</Text>
          <View className="mt-3 flex-row items-center">
            <Text family="nunito" weight="semibold" className="text-base text-[#0B8A3F]">
              {item.spent}
            </Text>
            <Text className="mx-1 text-base text-[#8F95A3]">/</Text>
            <Text family="nunito" weight="semibold" className="text-base text-[#D83A56]">
              {item.budget}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SpendingBreakdown;

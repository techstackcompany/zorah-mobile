import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "../ui/Text";

const BudgetExceededAlert = () => {
  return (
    <View className=" rounded-xl border border-red-400 bg-red-100/60 px-2.5 py-5">
      <View className="flex-row items-center justify-between">
        <Image
          source={require("@/assets/icons/info.svg")}
          style={{ width: 24, height: 24, marginRight: 8 }}
        />

        <View className="flex-1 pr-4">
          <Text weight="bold" className="text-sm text-textColor">
            Food & Drink budget almost exceeded
          </Text>
          <Text className="mt-2 text-sm text-red-400">₦15,500 of ₦16,500</Text>
        </View>
        <Pressable className="rounded border border-red-500 px-3 py-2">
          <Text weight="semibold" className="text-sm  text-red-500">
            Adjust
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default BudgetExceededAlert;


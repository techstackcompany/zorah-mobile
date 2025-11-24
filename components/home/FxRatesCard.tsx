import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { View } from "react-native";

type FxRate = {
  id: string;
  pair: string;
  code: string;
  change: number;
  price: string;
  flags: [ImageSource, ImageSource];
};

type FxRatesCardProps = {
  rates: FxRate[];
  currencySymbol: string;
};

const FxRatesCard: React.FC<FxRatesCardProps> = ({ rates, currencySymbol }) => {
  return (
    <View className="mt-8 rounded-3xl bg-white px-5 py-5">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold" className="text-base">
          Fx Rates
        </Text>
        <View className="flex-row items-center gap-2 rounded-full bg-secondary_100 px-3 py-1">
          <View className="h-2 w-2 rounded-full bg-secondary_500" />
          <Text className="text-xs text-secondary_500">Live</Text>
        </View>
      </View>

      <View className="mt-4 rounded-2xl px-3 py-3">
        {rates.map((rate, index) => {
          const changeColor =
            rate.change >= 0 ? COLORS.secondary_500 : "#F87171";
          return (
            <View
              key={rate.id}
              className={cn(
                "flex-row items-center justify-between py-3",
                index !== rates.length - 1 && "border-b border-grayLight",
              )}
            >
              <View className="flex-row items-center gap-3">
                <View className="relative h-8 w-10">
                  <Image
                    source={rate.flags[0]}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      position: "absolute",
                      left: 0,
                      top: 0,
                      borderWidth: 1,
                      borderColor: "#ffffff",
                    }}
                    contentFit="cover"
                  />
                  <Image
                    source={rate.flags[1]}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      position: "absolute",
                      right: 0,
                      top: 0,
                      borderWidth: 1,
                      borderColor: "#ffffff",
                    }}
                    contentFit="cover"
                  />
                </View>
                <View>
                  <Text weight="semibold">{rate.pair}</Text>
                  <Text className="text-xs text-textColor/50">{rate.code}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text weight="semibold" className="text-base">
                  {rate.price}
                  <Text className="text-xs text-textColor/60">
                    {currencySymbol}
                  </Text>
                </Text>
                <Text className="text-xs" style={{ color: changeColor }}>
                  {rate.change > 0 ? "+" : ""}
                  {rate.change.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default FxRatesCard;


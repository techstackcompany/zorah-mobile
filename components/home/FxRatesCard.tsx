import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import {
  CURRENCY_FLAGS,
  FxPair,
  formatCurrency,
  getChangeColor,
} from "@/constants/fx";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, View } from "react-native";

type FxRatesCardProps = {
  rates: FxPair[];
  isLoading?: boolean;
  error?: { message?: string } | null;
};

const FxRatesCard: React.FC<FxRatesCardProps> = ({
  rates,
  isLoading = false,
  error = null,
}) => {
  return (
    <View className="mt-8 rounded-3xl bg-white px-5 py-5">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold" className="text-base">
          Fx Rates
        </Text>
        {/* <View className="flex-row items-center gap-2 rounded-full bg-secondary_100 px-3 py-1">
          <View className="h-2 w-2 rounded-full bg-secondary_500" />
          <Text className="text-xs text-secondary_500">Live</Text>
        </View> */}
      </View>

      <View className="mt-4 rounded-2xl px-3 py-3">
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary_400} />
        ) : error ? (
          <View className="py-6">
            <Text className="text-center text-sm text-red-500">
              Failed to load exchange rates
            </Text>
            <Text className="mt-1 text-center text-xs text-textColor/60">
              Pull down to refresh
            </Text>
          </View>
        ) : rates.length > 0 ? (
          rates.map((rate, index) => {
            const changeColor = getChangeColor(rate.change);
            const baseFlag = CURRENCY_FLAGS[rate.base];
            const quoteFlag = CURRENCY_FLAGS[rate.quote];
            const formattedPrice = formatCurrency(rate.value, rate.quote);
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
                    {baseFlag ? (
                      <Image
                        source={baseFlag}
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
                    ) : null}
                    {quoteFlag ? (
                      <Image
                        source={quoteFlag}
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
                    ) : null}
                  </View>
                  <View>
                    <Text weight="semibold">{rate.label}</Text>
                    <Text className="text-xs text-textColor/50">
                      {rate.base}/{rate.quote}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text weight="semibold" className="text-base">
                    {formattedPrice}
                  </Text>
                  <Text className="text-xs" style={{ color: changeColor }}>
                    {rate.change > 0 ? "+" : ""}
                    {rate.change.toFixed(2)}%
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="py-6">
            <Text className="text-center text-sm text-textColor/60">
              No exchange rate data available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FxRatesCard;

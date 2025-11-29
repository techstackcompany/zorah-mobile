import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { useGetFinancialTipQuery } from "@/src/api/hooks/useTipsApi";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import React from "react";
import { ActivityIndicator, View } from "react-native";

const FinancialTipCard: React.FC = () => {
  const { data, isLoading, error } = useGetFinancialTipQuery();

  return (
    <ImageBackground
      style={{
        marginTop: 32,
        borderRadius: 18,
        padding: 14,
        backgroundColor: COLORS.secondary_200,
      }}
      source={require("@/assets/images/bg-patterns/fold-pattern.png")}
    >
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
          <Ionicons name="bulb" size={24} color={COLORS.secondary_500} />
        </View>
        <Text weight="bold" className="text-xl">
          Financial Tip
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={COLORS.secondary_500} />
      ) : (
        <Text className="text-sm text-textColor/60">
          {error
            ? "Could not load financial tip. Please try again later."
            : data?.tip ||
              "Set aside ₦500 daily for emergencies. Small amounts add up to big savings over time!"}
        </Text>
      )}
    </ImageBackground>
  );
};

export default FinancialTipCard;

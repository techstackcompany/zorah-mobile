import Text from "@/components/ui/Text";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

type Props = {
  onPress?: () => void;
};

const BobbieCard: React.FC<Props> = ({ onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className="mt-6 rounded-3xl"
      style={{
        shadowColor: "#14AE5C",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={["#D8FFE8", "#F0FFF7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          paddingVertical: 22,
          paddingHorizontal: 20,
        }}
      >
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#2AAF66]">
            <Ionicons name="sparkles-outline" size={24} color="#ffffff" />
          </View>
          <View className="flex-1 flex-row items-baseline">
            <Text family="nunito" weight="bold" className="text-lg text-[#046C3F]">
              Bobbie
            </Text>
            <Text className="ml-1 text-lg text-[#046C3F] opacity-80">
              AI Assistance
            </Text>
          </View>
        </View>
        <Text className="text-sm leading-[20px] text-[#0F3D2E] opacity-80">
          Oga, you don spend 90% of your food budget this month. Maybe na time
          to cook more at home.
        </Text>
        <Text className="mt-5 text-sm text-[#046C3F]">Tap to chat →</Text>
      </LinearGradient>
    </Pressable>
  );
};

export default BobbieCard;

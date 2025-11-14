import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tier3VerifiedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F5F6FF]">
      <View className="flex-1 items-center justify-between px-6 py-10">
        <View className="items-start w-full">
          <Pressable className="rounded-full bg-white p-2 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
            <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
          </Pressable>
        </View>

        <View className="items-center gap-4">
          <View className="h-40 w-40 items-center justify-center rounded-full bg-white shadow-[0px_20px_40px_rgba(15,24,63,0.15)]">
            <Ionicons name="person" size={90} color="#1A3AC9" />
          </View>
          <Text className="text-2xl text-[#101326]" weight="semibold">
            Identity Verified
          </Text>
        </View>

        <View className="w-full space-y-3">
          <Pressable className="rounded-[20px] border border-[#1A43BE] px-6 py-3">
            <Text className="text-center text-[15px] text-[#1A43BE]" weight="semibold">
              Retake
            </Text>
          </Pressable>
          <Pressable className="rounded-[20px] bg-[#1A43BE] px-6 py-3">
            <Text className="text-center text-[15px] text-white" weight="semibold">
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

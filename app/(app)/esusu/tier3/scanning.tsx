import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tier3ScanningScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FF]">
      <View className="flex-1 items-center justify-between px-6 py-10">
        <View className="items-start w-full">
          <Pressable className="rounded-full bg-white p-2 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
            <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
          </Pressable>
        </View>

        <View className="items-center gap-4">
          <View className="h-64 w-64 items-center justify-center rounded-[26px] border border-[#BAC1F0] bg-white shadow-[0px_30px_60px_rgba(15,24,63,0.16)]">
            <Ionicons name="scan" size={64} color="#3F54EE" />
          </View>
          <Text className="text-2xl text-[#111326]" weight="semibold">
            Scanning your face
          </Text>
          <Text className="text-center text-[14px] text-[#5F6380]">
            Please keep your face centered on the screen and facing forward.
          </Text>
        </View>

        <Pressable className="w-full rounded-[22px] bg-[#1A43BE] px-6 py-3">
          <Text className="text-center text-[15px] text-white" weight="semibold">
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

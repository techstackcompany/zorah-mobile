import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, View } from "react-native";

export default function Tier3SuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FF]">
      <View className="flex-1 items-center justify-between px-6 py-10">
        <View className="items-start w-full">
          <Pressable className="rounded-full bg-white p-2 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
            <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
          </Pressable>
        </View>

        <View className="items-center gap-4">
          <View className="h-40 w-40 items-center justify-center rounded-full bg-white shadow-[0px_20px_40px_rgba(21,133,87,0.2)]">
            <Ionicons name="checkmark-circle" size={120} color="#32A34D" />
          </View>
          <Text className="text-2xl text-[#0E1225]" weight="semibold">
            Verification Successful
          </Text>
        </View>

        <View className="w-full space-y-3">
          <Pressable className="rounded-[20px] bg-[#1A43BE] px-6 py-3">
            <Text className="text-center text-[15px] text-white" weight="semibold">
              Create Group
            </Text>
          </Pressable>
          <Pressable className="rounded-[20px] border border-[#1A43BE] px-6 py-3">
            <Text className="text-center text-[15px] text-[#1A43BE]" weight="semibold">
              Go to Dashboard
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

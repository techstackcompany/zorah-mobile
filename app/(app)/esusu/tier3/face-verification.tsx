import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

const guidelines = [
  "Take a clear, well-lit photo",
  "Face the camera directly",
  "No glasses or head coverings",
  "Ensure your full face is visible",
];

export default function Tier3FaceVerificationScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FE]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable className="rounded-full bg-white p-2 shadow-[0px_8px_30px_rgba(0,0,0,0.1)]">
            <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
          </Pressable>
          <Text className="text-lg text-[#0F1230]" weight="semibold">
            Upgrade to Tier 3
          </Text>
          <View className="w-10" />
        </View>

        <View className="mt-5 rounded-[18px] bg-white px-4 py-3 shadow-[0px_10px_30px_rgba(0,0,0,0.05)]">
          <View className="h-2 w-full rounded-full bg-[#E4E6F3]">
            <View className="h-2 w-full rounded-full bg-[#24A5FF]" />
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[13px] text-[#6E7391]">Selfie Verification</Text>
            <Text className="text-[12px] text-[#7C83A2]">Step 2 of 2</Text>
          </View>
        </View>

        <View className="mt-6 rounded-[24px] bg-white px-5 py-6 shadow-[0px_20px_50px_rgba(20,29,76,0.1)]">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person" size={18} color="#1A3AC9" />
            <Text weight="semibold" className="text-[16px] text-[#1A1A2E]">
              Face Detection
            </Text>
          </View>
          <Text className="mt-2 text-[13px] text-[#6E7391]">
            Scan your face to verify your identity
          </Text>

          <View className="mt-6 h-48 items-center justify-center rounded-[26px] border border-dashed border-[#D1D5EB] bg-[#F3F5FF]">
            <Ionicons name="camera" size={48} color="#3F4AE5" />
            <Text className="mt-2 text-[14px] text-[#5A5F80]">Face detection frame</Text>
          </View>

          <View className="mt-6 space-y-2 rounded-[16px] bg-[#F7F8FF] p-4">
            {guidelines.map((item, index) => (
              <View key={item} className="flex-row items-start gap-2">
                <View className="mt-1 h-2 w-2 rounded-full bg-[#3F4AE5]" />
                <Text className="text-[13px] text-[#4B4F63]">{index + 1}. {item}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable className="mt-8 rounded-[20px] bg-[#1A43BE] px-6 py-3">
          <Text className="text-center text-[15px] text-white" weight="semibold">
            Take Photo
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

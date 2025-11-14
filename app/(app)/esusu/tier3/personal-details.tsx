import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tier3PersonalDetailsScreen() {
  const [nationality, setNationality] = useState("Nigeria");
  const [bvn, setBvn] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [proof, setProof] = useState("");

  const isFormValid = useMemo(() => {
    return !!(nationality && bvn && dob && address && proof);
  }, [address, bvn, dob, nationality, proof]);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7FB]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable className="rounded-full bg-white p-2 shadow-[0px_10px_30px_rgba(0,0,0,0.1)]">
            <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
          </Pressable>
          <Text className="text-lg text-[#0F1230]" weight="semibold">
            Upgrade to Tier 3
          </Text>
          <View className="w-10" />
        </View>

        <View className="mt-5 rounded-[18px] bg-white px-4 py-3 shadow-[0px_10px_30px_rgba(0,0,0,0.05)]">
          <View className="h-2 w-full rounded-full bg-[#E4E6F3]">
            <View className="h-2 w-3/5 rounded-full bg-[#24A5FF]" />
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[13px] text-[#6E7391]">Personal Details</Text>
            <Text className="text-[12px] text-[#7C83A2]">Step 1 of 2</Text>
          </View>
        </View>

        <View className="mt-5 space-y-4 rounded-[20px] bg-white px-5 py-5 shadow-[0px_20px_50px_rgba(21,26,59,0.06)]">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person-circle" size={18} color="#1A3AC9" />
            <Text weight="semibold" className="text-[15px] text-[#1A1A2E]">
              Personal Details
            </Text>
          </View>

          <View className="space-y-3">
            <Text className="text-[13px] text-[#6E7391]">Nationality</Text>
            <Pressable className="flex-row items-center justify-between rounded-[14px] border border-[#E4E6F3] bg-[#F7F8FF] px-4 py-3">
              <Text className="text-[14px] text-[#1A1A2E]" weight="medium">
                {nationality}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6B708F" />
            </Pressable>
          </View>

          <View className="space-y-3">
            <Text className="text-[13px] text-[#6E7391]">BVN</Text>
            <TextInput
              value={bvn}
              onChangeText={setBvn}
              placeholder="11 digit number"
              keyboardType="number-pad"
              className="rounded-[14px] border border-[#E4E6F3] bg-white px-4 py-3 text-[14px] text-[#1A1A2E]"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-[13px] text-[#6E7391]">Date Of Birth</Text>
            <View className="flex-row items-center justify-between rounded-[14px] border border-[#E4E6F3] bg-white px-4 py-3">
              <Text className="text-[14px] text-[#1A1A2E]">{dob || "DD/MM/YY"}</Text>
              <Ionicons name="calendar" size={18} color="#6B708F" />
            </View>
          </View>

          <View className="space-y-3">
            <Text className="text-[13px] text-[#6E7391]">Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              className="rounded-[14px] border border-[#E4E6F3] bg-white px-4 py-3 text-[14px] text-[#1A1A2E]"
            />
          </View>

          <View className="space-y-3">
            <Text className="text-[13px] text-[#6E7391]">Upload Proof of Address</Text>
            <Pressable
              className="flex-row items-center justify-between rounded-[14px] border border-[#E4E6F3] bg-white px-4 py-3"
              onPress={() => setProof("Passport Photo")}
            >
              <Text className="text-[14px] text-[#1A1A2E]">{proof || "Upload File"}</Text>
              <Text className="text-[12px] text-[#4E56D6]">Browse</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className={`mt-6 rounded-[18px] px-6 py-3 ${isFormValid ? "bg-[#1A43BE]" : "bg-[#CAD1FF]"}`}
        >
          <Text className="text-center text-[15px] text-white" weight="semibold">
            Next
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

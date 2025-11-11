import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type GroupSavingsCardProps = {
  onCreateGroup?: () => void;
};

export default function GroupSavingsCard({
  onCreateGroup,
}: GroupSavingsCardProps) {
  return (
    <View className="mt-6 items-start rounded-[26px] bg-[#EEF2FF] px-6 py-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl text-textColor" weight="bold">
          Group Savings
        </Text>
      </View>
      <Text weight="bold" className="mt-2 text-sm text-textColor/60">
        Manage your Ajo/Esusu savings groups
      </Text>
      <Pressable
        onPress={onCreateGroup}
        className="mt-6 flex-row items-center gap-2 rounded-xl bg-primary_400/70 px-5 py-3"
      >
        <Ionicons name="add-circle-outline" size={20} color="white" />
        <Text className="text-center text-[15px] text-white" weight="semibold">
          Create New Group
        </Text>
      </Pressable>
    </View>
  );
}

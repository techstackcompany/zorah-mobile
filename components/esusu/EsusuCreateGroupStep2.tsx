import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { MOCK_ESUSU_MEMBERS } from "@/features/esusu/mockData";
import { EsusuMember } from "@/features/esusu/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

interface EsusuCreateGroupStep2Props {
  selectedMemberIds: string[];
  onToggleMember: (memberId: string) => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

export const EsusuCreateGroupStep2 = ({
  selectedMemberIds,
  onToggleMember,
  onPrevious,
  onSubmit,
}: EsusuCreateGroupStep2Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const members: EsusuMember[] = MOCK_ESUSU_MEMBERS;

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  return (
    <View className="pb-6">
      {/* Section Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={20} color={COLORS.primary_400} />
          <Text family="nunito" weight="bold" className="ml-2 text-base text-textColor">
            Membership Management
          </Text>
        </View>

        {/* Selected Count Badge */}
        <View className="rounded-full bg-[#EAF2FF] px-2.5 py-0.5">
          <Text family="nunito" weight="bold" className="text-xs text-primary_400">
            {selectedMemberIds.length}
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white px-3.5 py-2.5">
        <Ionicons name="search-outline" size={18} color="#848484" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Circle Members..."
          placeholderTextColor="#848484"
          style={{ fontFamily: "NunitoMedium", includeFontPadding: false }}
          className="ml-2.5 flex-1 p-0 text-sm text-textColor"
          autoCapitalize="none"
        />
      </View>

      {/* Members List */}
      <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filteredMembers.map((member, index) => {
          const isSelected = selectedMemberIds.includes(member.id);
          return (
            <Pressable
              key={member.id}
              onPress={() => onToggleMember(member.id)}
              className={`flex-row items-center justify-between px-4 py-3 active:bg-gray-50 ${
                index < filteredMembers.length - 1 ? "border-b border-gray-50" : ""
              }`}
              accessibilityRole="button"
              accessibilityLabel={`${member.name}, ${isSelected ? "selected" : "not selected"}`}
            >
              {/* Member Avatar + Info */}
              <View className="flex-1 flex-row items-center">
                <Image
                  source={{ uri: member.avatarUrl }}
                  style={{ width: 42, height: 42, borderRadius: 21 }}
                  contentFit="cover"
                />
                <View className="ml-3 flex-1">
                  <Text family="nunito" weight="bold" className="text-sm text-textColor">
                    {member.name}
                  </Text>
                  <Text family="nunito" weight="regular" className="mt-0.5 text-xs text-textColor/50">
                    {member.phone}
                  </Text>
                </View>
              </View>

              {/* Toggle Icon */}
              <Pressable
                hitSlop={8}
                onPress={() => onToggleMember(member.id)}
                accessibilityRole="button"
                accessibilityLabel={isSelected ? "Remove member" : "Add member"}
              >
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                  size={24}
                  color={isSelected ? COLORS.secondary_500 : COLORS.primary_400}
                />
              </Pressable>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Action Buttons: Previous & Next */}
      <View className="mt-8 flex-row gap-3">
        <Pressable
          onPress={onPrevious}
          className="flex-1 items-center justify-center rounded-xl border border-primary_400 bg-white py-3.5 active:bg-gray-50"
          accessibilityRole="button"
          accessibilityLabel="Go back to Step 1"
        >
          <Text family="nunito" weight="semibold" className="text-base text-primary_400">
            Previous
          </Text>
        </Pressable>

        <Pressable
          onPress={onSubmit}
          className="flex-1 items-center justify-center rounded-xl bg-primary_400 py-3.5 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Complete creating group"
        >
          <Text family="nunito" weight="semibold" className="text-base text-white">
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

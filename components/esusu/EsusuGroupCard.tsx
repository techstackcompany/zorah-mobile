import { ScalePressable } from "@/components/ui/ScalePressable";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { EsusuGroup, EsusuStatus, PickerType } from "@/features/esusu/types";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface EsusuGroupCardProps {
  group: EsusuGroup;
  onPress?: () => void;
  onPressMore?: () => void;
}

const STATUS_CONFIG: Record<
  EsusuStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  active: {
    label: "Active",
    bgClass: "bg-secondary_100",
    textClass: "text-secondary_500",
  },
  pending: {
    label: "Pending",
    bgClass: "bg-[#FFF7ED]",
    textClass: "text-[#EA580C]",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-primary_200",
    textClass: "text-primary_400",
  },
};

const PICKER_LABELS: Record<PickerType, string> = {
  rotation: "Rotating Picker",
  manual: "Manual Picker",
  automatic: "Automatic Picker",
};

// Placeholder name for the "Next Picker" row shown on every card in the
// design images — the group model has no real member data to draw from
// yet, so this stands in until group membership is wired to the API.
const NEXT_PICKER_PLACEHOLDER = {
  name: "Robert Johnson",
};

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export const EsusuGroupCard = ({
  group,
  onPress,
  onPressMore,
}: EsusuGroupCardProps) => {
  const statusMeta = STATUS_CONFIG[group.status] ?? STATUS_CONFIG.active;
  const pickerLabel = group.pickerType ? PICKER_LABELS[group.pickerType] : null;
  const progressPercent = Math.min(
    100,
    Math.round((group.memberCount / group.totalMembers) * 100),
  );

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progressPercent, { duration: 700 });
  }, [progressPercent, progressWidth]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handlePress = () => {
    // TODO: wire to API
    onPress?.();
  };

  return (
    <ScalePressable
      scaleTo={0.98}
      onPress={handlePress}
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4"
      accessibilityRole="button"
      accessibilityLabel={`${group.name} group card`}
    >
      <View className="flex-row items-center justify-between">
        <Text
          family="nunito"
          weight="bold"
          className="flex-1 text-lg text-textColor"
        >
          {group.name}
        </Text>
        <Pressable
          hitSlop={10}
          onPress={onPressMore}
          accessibilityRole="button"
          accessibilityLabel={`More actions for ${group.name}`}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={COLORS.textColor}
          />
        </Pressable>
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <View className={cn("rounded-full px-2.5 py-0.5", statusMeta.bgClass)}>
          <Text
            family="nunito"
            weight="semibold"
            className={cn("text-xs", statusMeta.textClass)}
          >
            {statusMeta.label}
          </Text>
        </View>
        {pickerLabel ? (
          <View className="rounded-full bg-gray-100 px-2.5 py-0.5">
            <Text
              family="nunito"
              weight="semibold"
              className="text-xs text-textColor/70"
            >
              {pickerLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Text
          family="nunito"
          weight="regular"
          className="text-sm text-textColor/60"
        >
          Cycle Progress
        </Text>
        <Text
          family="nunito"
          weight="medium"
          className="text-sm text-textColor/60"
        >
          {group.memberCount} of {group.totalMembers}
        </Text>
      </View>

      <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <Animated.View
          style={progressBarStyle}
          className={cn(
            "h-full rounded-full",
            group.status === "completed"
              ? "bg-secondary_500"
              : "bg-primary_400",
          )}
        />
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View className="flex-row items-center">
          <View
            className="items-center justify-center rounded-full bg-primary_200"
            style={{ width: 28, height: 28 }}
          >
            <Text
              family="nunito"
              weight="bold"
              className="text-sm text-primary_400"
            >
              {getInitials(NEXT_PICKER_PLACEHOLDER.name)}
            </Text>
          </View>
          <View className="ml-2">
            <Text
              family="nunito"
              weight="regular"
              className="text-sm text-textColor/50"
            >
              Next Picker
            </Text>
            <Text
              family="nunito"
              weight="bold"
              className="text-sm text-textColor"
            >
              {NEXT_PICKER_PLACEHOLDER.name}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={12}
              color={COLORS.textColor + "80"}
            />
            <Text
              family="nunito"
              weight="regular"
              className="mb-1 ml-1 text-sm text-textColor/50"
            >
              Last Payment:
            </Text>
          </View>
          <Text
            family="nunito"
            weight="bold"
            className="text-sm text-textColor"
          >
            {group.nextContributionDate}
          </Text>
        </View>
      </View>
    </ScalePressable>
  );
};

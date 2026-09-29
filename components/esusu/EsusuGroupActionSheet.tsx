import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import { Pressable, View } from "react-native";

interface EsusuGroupActionSheetProps {
  onAdjustContribution: () => void;
  onRescheduleCycle: () => void;
  onAddRemoveMembers: () => void;
  onViewGroup: () => void;
  onTrackPayment: () => void;
  onInviteMembers: () => void;
  onFreezeCloseGroup: () => void;
}

const ActionRow = ({
  label,
  onPress,
  disabled,
  destructive,
  indent,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  indent?: boolean;
}) => (
  <Pressable
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
    className={cn(
      "flex-row items-center  py-4 active:bg-gray-50",
      indent ? "pl-4" : "px-0",
    )}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
  >
    <Text
      family="nunito"
      weight="medium"
      className={cn(
        "text-base",
        destructive
          ? "text-error"
          : disabled
            ? "text-textColor/30"
            : "text-textColor",
      )}
    >
      {label}
    </Text>
  </Pressable>
);

export const EsusuGroupActionSheet = forwardRef<
  SlideUpModalRef,
  EsusuGroupActionSheetProps
>(
  (
    {
      onAdjustContribution,
      onRescheduleCycle,
      onAddRemoveMembers,
      onViewGroup,
      onTrackPayment,
      onInviteMembers,
      onFreezeCloseGroup,
    },
    ref,
  ) => {
    const [editExpanded, setEditExpanded] = useState(false);

    return (
      <SlideUpModal
        ref={ref}
        title="Action"
        headerTextColor="#FFFFFF"
        className="px-5 py-2"
      >
        <View>
          <Pressable
            onPress={() => setEditExpanded((prev) => !prev)}
            className="flex-row items-center justify-between py-4 active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel="Edit Group Information"
          >
            <Text
              family="nunito"
              weight="medium"
              className="text-base text-textColor"
            >
              Edit Group Information
            </Text>
            <Ionicons
              name={editExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={COLORS.textColor}
            />
          </Pressable>

          {editExpanded && (
            <>
              <ActionRow
                label="Adjust Contribution Amt. Cycle"
                onPress={onAdjustContribution}
                indent
              />
              <ActionRow
                label="Reschedule Cycle"
                onPress={onRescheduleCycle}
                indent
              />
            </>
          )}

          <ActionRow label="Add/Remove members" onPress={onAddRemoveMembers} />
          <ActionRow label="View Group" onPress={onViewGroup} />
          <ActionRow
            label="Track Payment & Contribution"
            onPress={onTrackPayment}
          />
          <ActionRow label="Leave Group" disabled />
          <ActionRow label="Invite Members" onPress={onInviteMembers} />
          <ActionRow
            label="Freeze/Close Group"
            onPress={onFreezeCloseGroup}
            destructive
          />
        </View>
      </SlideUpModal>
    );
  },
);

EsusuGroupActionSheet.displayName = "EsusuGroupActionSheet";

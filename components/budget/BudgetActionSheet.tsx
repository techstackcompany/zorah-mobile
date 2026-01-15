import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, View } from "react-native";

export interface BudgetAction {
  label: string;
  enabled: boolean;
  action: () => void;
}

interface BudgetActionSheetProps {
  onClose?: () => void;
  actions: BudgetAction[];
  onActionPress: (action: BudgetAction) => void;
}

export type BudgetActionSheetRef = SlideUpModalRef;

const BudgetActionSheet = forwardRef<
  BudgetActionSheetRef,
  BudgetActionSheetProps
>(({ onClose, actions, onActionPress }, ref) => {
  const modalRef = useRef<SlideUpModalRef>(null);

  useImperativeHandle(ref, () => ({
    present: () => modalRef.current?.present(),
    dismiss: () => modalRef.current?.dismiss(),
  }));

  return (
    <SlideUpModal
      ref={modalRef}
      onClose={onClose}
      title="Action"
      headerBackgroundColor={COLORS.primary_400}
      headerTextColor="#fff"
      closeIconColor="#fff"
      className="px-0"
    >
      <View className="gap-2">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            className="rounded-2xl bg-white px-4 py-3"
            onPress={() => {
              onActionPress(action);
              onClose();
            }}
            disabled={!action.enabled}
          >
            <Text
              className={`text-base ${
                action.enabled ? "text-textColor" : "text-textColor/40"
              }`}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SlideUpModal>
  );
});

BudgetActionSheet.displayName = "BudgetActionSheet";

export default BudgetActionSheet;

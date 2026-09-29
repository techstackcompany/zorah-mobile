import SlideUpModal, { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import { CreateEsusuFormData } from "@/features/esusu/types";
import { formatAmountValue } from "@/lib/amount";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";

interface EsusuCirclePreviewSheetProps {
  formData: CreateEsusuFormData;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const MetaStat = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text family="nunito" weight="regular" className="text-xs text-white/70">
      {label}
    </Text>
    <Text family="nunito" weight="bold" className="mt-0.5 text-sm text-white">
      {value}
    </Text>
  </View>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between py-2">
    <Text family="nunito" weight="regular" className="text-sm text-textColor/60">
      {label}:
    </Text>
    <Text family="nunito" weight="bold" className="text-sm text-textColor">
      {value}
    </Text>
  </View>
);

export const EsusuCirclePreviewSheet = forwardRef<
  SlideUpModalRef,
  EsusuCirclePreviewSheetProps
>(({ formData, onBack, onConfirm, isSubmitting }, ref) => {
  const formattedAmount = formData.contributionAmount
    ? formatAmountValue(formData.contributionAmount, {
        currencySymbol: "₦",
        forceFixedDecimals: true,
      })
    : "₦ 0.00";

  return (
    <SlideUpModal ref={ref} title="Circle Preview" headerTextColor="#FFFFFF" className="px-5 py-4">
      <View>
        {/* Summary Card */}
        <View className="rounded-2xl bg-primary_400 p-4">
          <View className="flex-row items-start justify-between">
            <Text family="degular" weight="bold" className="flex-1 text-lg text-white">
              {formData.groupName || "Untitled Circle"}
            </Text>
            <View className="rounded-full bg-white/20 px-2.5 py-0.5">
              <Text family="nunito" weight="semibold" className="text-xs text-white">
                New
              </Text>
            </View>
          </View>

          {/* Description omitted — not currently collected by Step 1 */}
          {/* {formData.description ? (
            <Text
              family="nunito"
              weight="regular"
              className="mt-1 text-xs text-white/80"
              numberOfLines={2}
            >
              {formData.description}
            </Text>
          ) : null} */}

          <View className="mt-4 flex-row justify-between">
            <MetaStat label="Frequency" value={formData.frequency} />
            {/* Picker Type omitted — not currently collected by Step 1 */}
            {/* <MetaStat
              label="Picker Type"
              value={PICKER_LABELS[formData.pickerType]}
            /> */}
            {/* Penalty Fee omitted — not currently collected by Step 1 */}
            {/* <MetaStat
              label="Penalty Fee"
              value={formData.penaltyFee ? `₦${formData.penaltyFee}` : "₦0.00"}
            /> */}
          </View>
        </View>

        {/* Contribution Details */}
        <View className="mt-5 flex-row items-center">
          <Ionicons name="receipt-outline" size={18} color="#1A43BE" />
          <Text family="nunito" weight="bold" className="ml-2 text-base text-textColor">
            Contribution Details
          </Text>
        </View>
        <View className="mt-2 border-t border-gray-100">
          <DetailRow label="Contribution Amount" value={formattedAmount} />
          <View className="border-t border-gray-50" />
          <DetailRow label="Frequency" value={formData.frequency} />
          {/* Start Date omitted — not currently collected by Step 1 */}
          {/* <View className="border-t border-gray-50" />
          <DetailRow label="Start date" value={formData.startDate || "—"} /> */}
        </View>

        {/* Contributors list omitted — Step 2 member selection is currently
            disabled, so there is no selected-member list to preview here. */}
        {/* <View className="mt-5 flex-row items-center">
          <Ionicons name="people-outline" size={18} color="#1A43BE" />
          <Text family="nunito" weight="bold" className="ml-2 text-base text-textColor">
            Contributors ({formData.selectedMembers.length})
          </Text>
        </View> */}

        {/* Actions */}
        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={onBack}
            className="flex-1 items-center justify-center rounded-xl border border-primary_400 bg-white py-3.5 active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel="Back to edit circle details"
          >
            <Text family="nunito" weight="semibold" className="text-base text-primary_400">
              Back
            </Text>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            disabled={isSubmitting}
            className="flex-1 items-center justify-center rounded-xl bg-primary_400 py-3.5 active:opacity-90 disabled:opacity-60"
            accessibilityRole="button"
            accessibilityLabel="Create Group"
          >
            <Text family="nunito" weight="semibold" className="text-base text-white">
              {isSubmitting ? "Creating..." : "Create Group"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SlideUpModal>
  );
});

EsusuCirclePreviewSheet.displayName = "EsusuCirclePreviewSheet";

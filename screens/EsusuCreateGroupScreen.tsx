import { EsusuCirclePreviewSheet } from "@/components/esusu/EsusuCirclePreviewSheet";
import { EsusuCreateGroupStep1 } from "@/components/esusu/EsusuCreateGroupStep1";
import MainContainer from "@/components/layouts/MainContainer";
import { SlideUpModalRef } from "@/components/ui/SlideUpModal";
import Text from "@/components/ui/Text";
import COLORS from "@/constants/colors";
import { CreateEsusuFormData } from "@/features/esusu/types";
import { useCreateEsusuGroupMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const INITIAL_FORM_DATA: CreateEsusuFormData = {
  groupName: "",
  contributionAmount: "",
  frequency: "Monthly",
  totalRounds: "2",
  startDate: "",
  groupImageUri: undefined,
  penaltyFee: "",
  pickerType: "rotation",
  description: "",
  selectedMembers: [],
};

const EsusuCreateGroupScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] =
    useState<CreateEsusuFormData>(INITIAL_FORM_DATA);
  const previewSheetRef = useRef<SlideUpModalRef>(null);
  const { mutate: createGroup, isPending: isCreatingGroup } =
    useCreateEsusuGroupMutation();

  const handleFieldChange = <K extends keyof CreateEsusuFormData>(
    key: K,
    value: CreateEsusuFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // const handleToggleMember = (memberId: string) => {
  //   setFormData((prev) => {
  //     const exists = prev.selectedMembers.includes(memberId);
  //     return {
  //       ...prev,
  //       selectedMembers: exists
  //         ? prev.selectedMembers.filter((id) => id !== memberId)
  //         : [...prev.selectedMembers, memberId],
  //     };
  //   });
  // };

  const handleBack = () => {
    router.back();
  };

  const handleOpenPreview = () => {
    previewSheetRef.current?.present();
  };

  const handleConfirmCreate = () => {
    createGroup(
      {
        name: formData.groupName,
        contributionAmount: Number(formData.contributionAmount) || 0,
        frequency: formData.frequency.toLowerCase() as
          | "daily"
          | "weekly"
          | "monthly",
      },
      {
        onSuccess: () => {
          previewSheetRef.current?.dismiss();
          Toast.show({
            type: "success",
            text1: "Group Created",
            text2: `${formData.groupName || "Your savings circle"} has been created!`,
          });
          router.back();
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Couldn't create group",
            text2: error.message,
          });
        },
      },
    );
  };

  return (
    <MainContainer edges={["top", "bottom"]} className="bg-[#F8F9FA] pb-0">
      {/* Screen Header */}
      <View className="flex-row items-center bg-[#F8F9FA] px-4 pb-3 pt-2">
        <Pressable
          hitSlop={12}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 p-1"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textColor} />
        </Pressable>
        <Text family="nunito" weight="bold" className="text-xl text-textColor">
          Create New Esusu Group
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step Progress Indicator */}
          {/* <EsusuCreateStepIndicator step={step} /> */}
          <EsusuCreateGroupStep1
            formData={formData}
            onChangeField={handleFieldChange}
            onNext={handleOpenPreview}
          />
          {/* Form Step 1 vs Step 2 */}
          {/* {step === 1 ? (

          ) : (
            <EsusuCreateGroupStep2
              selectedMemberIds={formData.selectedMembers}
              onToggleMember={handleToggleMember}
              onPrevious={() => setStep(1)}
              onSubmit={handleSubmit}
            />
          )} */}
        </ScrollView>
      </KeyboardAvoidingView>

      <EsusuCirclePreviewSheet
        ref={previewSheetRef}
        formData={formData}
        onBack={() => previewSheetRef.current?.dismiss()}
        onConfirm={handleConfirmCreate}
        isSubmitting={isCreatingGroup}
      />
    </MainContainer>
  );
};

export default EsusuCreateGroupScreen;

import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { setupInfo } from "@/constants";
import { useSession } from "@/contexts/auth-context/useSession";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/api/client";
import { useUpdateOnboardingMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";

type Bank = {
  id: string;
  label: string;
};

type YourBanksScreenProps = {
  initialSelected?: string[];
  onSelectionChange?: (banks: string[]) => void;
};

const banks: Bank[] = [
  { id: "gtb", label: "GTBank" },
  { id: "zenith", label: "Zenith Bank" },
  { id: "access", label: "Access Bank" },
  { id: "first", label: "First Bank" },
  { id: "uba", label: "UBA" },
  { id: "kuda", label: "Kuda Bank" },
  { id: "opay", label: "Opay" },
  { id: "palmpay", label: "PalmPay" },
  { id: "moniepoint", label: "Moniepoint" },
  { id: "jaiz", label: "Jaiz Bank" },
  { id: "fidelity", label: "Fidelity Bank" },
  { id: "fcmb", label: "FCMB" },
];

const allowedBankIds = new Set(banks.map((bank) => bank.id));

const sanitizeSelection = (selection: readonly string[] = []) =>
  Array.from(new Set(selection.filter((bankId) => allowedBankIds.has(bankId))));

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const YourBanksScreen = ({
  initialSelected = [],
  onSelectionChange,
}: YourBanksScreenProps) => {
  const router = useRouter();
  const sanitizedInitial = useMemo(
    () => sanitizeSelection(initialSelected),
    [initialSelected],
  );
  const [selectedBanks, setSelectedBanks] =
    useState<string[]>(sanitizedInitial);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const queryClient = useQueryClient();
  const { setHasCompletedSetup, setSetupStep } = useSession();
  const updateOnboardingMutation = useUpdateOnboardingMutation();

  const { goToPreviousStep } = useSetUpStep(4);

  useEffect(() => {
    setSelectedBanks((prev) =>
      arraysEqual(prev, sanitizedInitial) ? prev : sanitizedInitial,
    );
  }, [sanitizedInitial]);

  const toggleBank = (bankId: string) => {
    setSelectedBanks((prev) => {
      const next = prev.includes(bankId)
        ? prev.filter((id) => id !== bankId)
        : [...prev, bankId];
      const sanitized = sanitizeSelection(next);
      if (!arraysEqual(prev, sanitized)) {
        onSelectionChange?.(sanitized);
      }
      return sanitized;
    });
  };

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const handleNext = async () => {
    if (selectedBanks.length === 0 || updateOnboardingMutation.isPending) {
      return;
    }

    onSelectionChange?.(selectedBanks);

    try {
      await updateOnboardingMutation.mutateAsync({
        data: {},
        step: setupInfo[4].key,
      });

      await queryClient.refetchQueries({
        queryKey: ["auth", "profile"],
        exact: true,
      });

      setHasCompletedSetup(true);
      setSetupStep(null);
      setShowCompletionModal(true);
    } catch (error) {
      const _error = error as ApiError;
      console.log("_error.message", _error.message);
      Toast.show({
        type: "error",
        text1: "Could not complete setup",
        text2: _error.message,
      });
    }
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    router.replace("/(app)/(home)");
  };

  return (
    <SetupContainer className="bg-light">
      <View className="flex-1">
        <SetupHeader
          currentStep={4}
          totalSteps={4}
          title="Your Banks"
          description="Select your banks to enable automatic expense tracking"
        />

        <View className="flex-1 px-6 pb-6">
          <View className="mt-6 flex-row flex-wrap justify-between">
            {banks.map((bank) => {
              const selected = selectedBanks.includes(bank.id);
              return (
                <Pressable
                  key={bank.id}
                  onPress={() => toggleBank(bank.id)}
                  className={cn(
                    "mb-4 w-[48%] flex-row items-center  gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4",
                    selected && "bg-primary_100",
                  )}
                >
                  <View
                    className={cn(
                      "h-7 w-7 items-center justify-center rounded-md border border-grey bg-white",
                      selected && "border-2 border-primary_400 bg-primary_400",
                    )}
                  >
                    {selected ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text weight="semibold" className="text-base text-textColor">
                    {bank.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-auto flex-row gap-4 pt-10">
            <Button
              title="Previous"
              disabled
              variant="outline"
              className="flex-1"
              onPress={handlePrevious}
            />
            <Button
              title="Finish"
              className="flex-1"
              onPress={handleNext}
              disabled={
                selectedBanks.length === 0 || updateOnboardingMutation.isPending
              }
            />
          </View>
        </View>
      </View>

      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCompletionModal}
      >
        <View className="flex-1 items-center justify-center bg-black/35 px-6">
          <View className="w-full max-w-[360px] rounded-2xl bg-white p-6">
            <Text weight="bold" className="text-xl text-textColor">
              Setup complete
            </Text>
            <Text className="mt-2 text-sm text-textColor/70">
              Your onboarding is complete. You can now start using all app
              features.
            </Text>

            <Button
              title="Continue"
              className="mt-5"
              onPress={handleCloseCompletionModal}
            />
          </View>
        </View>
      </Modal>
    </SetupContainer>
  );
};

export default YourBanksScreen;

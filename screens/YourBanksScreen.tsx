import SetupContainer from "@/components/layouts/SetupContainer";
import SetupHeader from "@/components/setup/SetupHeader";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { setupInfo } from "@/constants";
import useSetUpStep from "@/hooks/useSetUpStep";
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/api/client";
import { useGetUserProfileQuery, useUpdateOnboardingMutation } from "@/src/api/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
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

const normalizeText = (value: string) => value.trim().toLowerCase();

const bankIdLookup = new Map<string, string>(
  banks.flatMap((bank) => [
    [normalizeText(bank.id), bank.id],
    [normalizeText(bank.label), bank.id],
  ]),
);

const resolveBankId = (value: string): string | null => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const direct = bankIdLookup.get(normalized);
  if (direct) {
    return direct;
  }

  const compact = normalized.replace(/\s*bank$/, "");
  const looseMatch = banks.find(
    (bank) => normalizeText(bank.label).replace(/\s*bank$/, "") === compact,
  );

  return looseMatch?.id ?? null;
};

const sanitizeSelection = (selection: readonly string[] = []) =>
  Array.from(
    new Set(
      selection
        .map((bankValue) => resolveBankId(bankValue))
        .filter((bankId): bankId is string => Boolean(bankId)),
    ),
  );

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const YourBanksScreen = ({
  initialSelected = [],
  onSelectionChange,
}: YourBanksScreenProps) => {
  const sanitizedInitial = useMemo(
    () => sanitizeSelection(initialSelected),
    [initialSelected],
  );
  const [selectedBanks, setSelectedBanks] =
    useState<string[]>(sanitizedInitial);
  const queryClient = useQueryClient();
  const { data: userData } = useGetUserProfileQuery();
  const updateOnboardingMutation = useUpdateOnboardingMutation();

  const { goToPreviousStep, goToNextStep } = useSetUpStep(4);

  const { banksStepCompleted, prefilledBankIds } = useMemo(() => {
    const root = (userData ?? {}) as Record<string, unknown>;
    const onboarding =
      root.onboarding && typeof root.onboarding === "object"
        ? (root.onboarding as Record<string, unknown>)
        : null;
    const stepsCompleted = Array.isArray(onboarding?.stepsCompleted)
      ? (onboarding.stepsCompleted as unknown[]).filter(
          (entry): entry is string => typeof entry === "string",
        )
      : [];
    const rawBanks =
      (onboarding?.banks as unknown) ??
      (onboarding?.userBanks as unknown) ??
      (root.banks as unknown) ??
      [];
    const list = Array.isArray(rawBanks)
      ? rawBanks.filter((entry): entry is string => typeof entry === "string")
      : [];
    return {
      banksStepCompleted: stepsCompleted.includes(setupInfo[4].key),
      prefilledBankIds: sanitizeSelection(list),
    };
  }, [userData]);

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
    if (updateOnboardingMutation.isPending) {
      return;
    }
    if (banksStepCompleted && selectedBanks.length === 0) {
      goToNextStep();
      return;
    }
    if (selectedBanks.length === 0) {
      return;
    }

    onSelectionChange?.(selectedBanks);

    const sortedCurrent = [...selectedBanks].sort();
    const sortedPrefill = [...prefilledBankIds].sort();
    const unchanged =
      sortedCurrent.length === sortedPrefill.length &&
      sortedCurrent.every((value, index) => value === sortedPrefill[index]);

    if (banksStepCompleted && unchanged) {
      goToNextStep();
      return;
    }

    // Scoped to the network calls only — keeping navigation inside this try
    // meant a nav error surfaced to the user as "Could not save bank
    // selection" long after the save had already succeeded.
    try {
      await updateOnboardingMutation.mutateAsync({
        data: {},
        step: setupInfo[4].key,
      });

      await queryClient.refetchQueries({
        queryKey: ["auth", "profile"],
        exact: true,
      });
    } catch (error) {
      const _error = error as ApiError;
      console.error("_error.message", _error.message);
      Toast.show({
        type: "error",
        text1: "Could not save bank selection",
        text2: _error.message,
      });
      return;
    }

    goToNextStep();
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
              title="Next"
              className="flex-1"
              onPress={handleNext}
              disabled={
                (selectedBanks.length === 0 && !banksStepCompleted) ||
                updateOnboardingMutation.isPending
              }
            />
          </View>
        </View>
      </View>

    </SetupContainer>
  );
};

export default YourBanksScreen;

import { useQueryClient } from "@tanstack/react-query";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import { setLocalSetupFlag } from "@/hooks/useSetupProgress";
import YourBanksScreen from "@/screens/YourBanksScreen";
import React, { useCallback, useMemo } from "react";

const normalizeStringList = (value: unknown) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => entry.trim())
          .filter(Boolean),
      ),
    );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const getRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const YourBanks = () => {
  const queryClient = useQueryClient();
  const { data: userData } = useGetUserProfileQuery();

  const safeUserData = useMemo(
    () => (userData ?? {}) as Record<string, unknown>,
    [userData],
  );

  const onboarding = useMemo(
    () => getRecord(safeUserData.onboarding),
    [safeUserData],
  );

  const storedSelectedBanks = useMemo(
    () =>
      normalizeStringList(
        safeUserData.selectedBanks ??
          safeUserData.linkedBanks ??
          onboarding?.selectedBanks ??
          onboarding?.linkedBanks ??
          onboarding?.banks,
      ),
    [onboarding, safeUserData],
  );

  const handleSelectionChange = useCallback(
    (nextBanks: string[]) => {
      const sanitized = normalizeStringList(nextBanks);
      if (arraysEqual(sanitized, storedSelectedBanks)) {
        return;
      }

      setLocalSetupFlag("banks", true);

      queryClient.setQueryData(["auth", "profile"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          selectedBanks: sanitized,
        };
      });
    },
    [queryClient, storedSelectedBanks],
  );

  return (
    <YourBanksScreen
      initialSelected={storedSelectedBanks}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default YourBanks;

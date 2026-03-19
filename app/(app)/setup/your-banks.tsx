import { useSession } from "@/contexts/auth-context/useSession";
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

const YourBanks = () => {
  const { userData, setUserData } = useSession();

  const storedSelectedBanks = useMemo(
    () => normalizeStringList(userData?.selectedBanks),
    [userData],
  );

  const handleSelectionChange = useCallback(
    (nextBanks: string[]) => {
      const sanitized = normalizeStringList(nextBanks);
      if (arraysEqual(sanitized, storedSelectedBanks)) {
        return;
      }

      setLocalSetupFlag("banks", true);

      setUserData({
        ...(userData ?? {}),
        selectedBanks: sanitized,
      });
    },
    [setUserData, storedSelectedBanks, userData],
  );

  return (
    <YourBanksScreen
      initialSelected={storedSelectedBanks}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default YourBanks;

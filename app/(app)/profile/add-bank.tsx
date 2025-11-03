import { useSession } from "@/contexts/auth-context/useSession";
import YourBanksScreen from "@/screens/YourBanksScreen";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";

const tryParseJsonStringArray = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  } catch {
    // ignore JSON parse errors and fallback to comma parsing
  }
  return null;
};

const parseSelectedParam = (param?: string | string[]) => {
  if (!param) {
    return [];
  }

  const rawValues = Array.isArray(param) ? param : [param];

  const tokens = rawValues.flatMap((entry) => {
    if (typeof entry !== "string") {
      return [];
    }

    const trimmed = entry.trim();
    if (!trimmed) {
      return [];
    }

    const fromJson = tryParseJsonStringArray(trimmed);
    if (fromJson) {
      return fromJson;
    }

    return trimmed
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  });

  return Array.from(new Set(tokens));
};

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
    return tryParseJsonStringArray(value) ?? parseSelectedParam(value);
  }

  return [];
};

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const AddBankRoute = () => {
  const { selected } = useLocalSearchParams<{ selected?: string | string[] }>();
  const { userData, setUserData } = useSession();

  const selectedFromParams = useMemo(
    () => parseSelectedParam(selected),
    [selected],
  );

  const storedSelectedBanks = useMemo(
    () => normalizeStringList(userData?.selectedBanks),
    [userData],
  );

  const initialSelectedBanks = useMemo(
    () =>
      Array.from(
        new Set([...storedSelectedBanks, ...selectedFromParams]),
      ),
    [storedSelectedBanks, selectedFromParams],
  );

  const handleSelectionChange = useCallback(
    (nextBanks: string[]) => {
      const sanitized = normalizeStringList(nextBanks);
      if (arraysEqual(sanitized, storedSelectedBanks)) {
        return;
      }

      setUserData({
        ...(userData ?? {}),
        selectedBanks: sanitized,
      });
    },
    [storedSelectedBanks, setUserData, userData],
  );

  return (
    <YourBanksScreen
      initialSelected={initialSelectedBanks}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default AddBankRoute;

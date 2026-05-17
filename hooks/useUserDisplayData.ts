import { capitalizeWord, extractUserData } from "@/lib/utils";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import { useMemo } from "react";

type UserDisplayData = {
  initials: string;
  welcomeName: string;
};

export function useUserDisplayData(fallback?: {
  initials?: string;
  welcomeName?: string;
}): UserDisplayData {
  const { data: profileData } = useGetUserProfileQuery();

  return useMemo(() => {
    if (!profileData) {
      return {
        initials: fallback?.initials || "U",
        welcomeName: fallback?.welcomeName || "User",
      };
    }
    const defaultFallback = {
      initials: fallback?.initials || "U",
      welcomeName: fallback?.welcomeName || "User",
    };

    const userDataExtracted = extractUserData(profileData, {
      fallbackName: "",
      fallbackInitials: defaultFallback.initials,
    });

    if (!userDataExtracted.fullName) {
      return defaultFallback;
    }

    const nameParts = userDataExtracted.fullName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (!nameParts.length) {
      return defaultFallback;
    }

    const firstName =
      userDataExtracted.firstName ||
      nameParts[0] ||
      defaultFallback.welcomeName;
    const formattedFirstName = capitalizeWord(firstName);

    return {
      initials: userDataExtracted.initials,
      welcomeName: formattedFirstName || defaultFallback.welcomeName,
    };
  }, [profileData, fallback?.initials, fallback?.welcomeName]);
}

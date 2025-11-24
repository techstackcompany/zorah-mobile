import { useSession } from "@/contexts/auth-context/useSession";
import { extractUserData } from "@/lib/utils";
import { useMemo } from "react";

type UserDisplayData = {
  initials: string;
  welcomeName: string;
};

/**
 * Hook to extract and format user display data (initials and welcome name)
 * @param fallback - Optional fallback values if user data is not available
 * @returns Object containing initials and welcomeName
 */
export function useUserDisplayData(fallback?: {
  initials?: string;
  welcomeName?: string;
}): UserDisplayData {
  const { userData } = useSession();

  return useMemo(() => {
    const defaultFallback = {
      initials: fallback?.initials || "U",
      welcomeName: fallback?.welcomeName || "User",
    };

    const userDataExtracted = extractUserData(userData, {
      fallbackName: "",
      fallbackInitials: defaultFallback.initials,
    });

    if (!userDataExtracted.displayName) {
      return defaultFallback;
    }

    const nameParts = userDataExtracted.displayName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (!nameParts.length) {
      return defaultFallback;
    }

    const firstName = nameParts[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    return {
      initials: userDataExtracted.initials,
      welcomeName: formattedFirstName || defaultFallback.welcomeName,
    };
  }, [userData, fallback?.initials, fallback?.welcomeName]);
}

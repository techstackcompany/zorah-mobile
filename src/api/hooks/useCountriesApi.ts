import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiError, apiRequest, countriesClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiEnvelope, NigerianState } from "../types";

const useNigerianStatesApi = (
  options?: Partial<UseQueryOptions<NigerianState[], ApiError>>,
) =>
  useQuery<NigerianState[], ApiError>({
    queryKey: ["ng-states"],
    queryFn: async () => {
      const response = await apiRequest<
        ApiEnvelope<{
          states: NigerianState[];
          iso2: string;
          iso3: string;
          name: string;
        }>
      >(
        {
          ...API_ENDPOINTS.countries.nigerianStates,
          data: { country: "Nigeria" },
        },
        countriesClient,
      );
      console.log("response", response);
      return response.data?.states || [];
    },
    staleTime: Infinity,
    ...options,
  });
export { useNigerianStatesApi };

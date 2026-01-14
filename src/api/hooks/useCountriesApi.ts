import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {  ApiEnvelope, NigerianState } from "../types";
import { ApiError, apiRequest, countriesClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

const useNigerianStatesApi = (options?:Partial<UseQueryOptions<NigerianState[], ApiError>>) =>
  useQuery<NigerianState[], ApiError>({
    queryKey: ["nigerian-states"],
    queryFn: async () => {
        const response = await apiRequest<ApiEnvelope<NigerianState[]>>(API_ENDPOINTS.countries.nigerianStates, countriesClient);
        
        return response.state as NigerianState[];
    },
    staleTime: Infinity,
    ...options,
  });
export { useNigerianStatesApi };



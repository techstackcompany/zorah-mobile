import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiEnvelope, SubmitKycRequest, SubmitKycResponse } from "../types";

export const useSubmitKycMutation = (
  options?: UseMutationOptions<ApiEnvelope<SubmitKycResponse>, ApiError, SubmitKycRequest>,
) =>
  useMutation<ApiEnvelope<SubmitKycResponse>, ApiError, SubmitKycRequest>({
    mutationKey: ["kyc", "submit"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SubmitKycResponse>>({
        ...API_ENDPOINTS.kyc.submit,
        data: payload,
      }),
    ...options,
  });

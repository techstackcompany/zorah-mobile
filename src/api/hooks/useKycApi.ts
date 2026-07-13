import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiEnvelope, SubmitKycRequest, SubmitKycResponse } from "../types";

// Accepts a plain object (tier 1, during setup) or FormData (tier 2 upgrade,
// matches the backend's documented multipart contract for /kyc/submit).
export const useSubmitKycMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<SubmitKycResponse>,
    ApiError,
    SubmitKycRequest | FormData
  >,
) =>
  useMutation<
    ApiEnvelope<SubmitKycResponse>,
    ApiError,
    SubmitKycRequest | FormData
  >({
    mutationKey: ["kyc", "submit"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<SubmitKycResponse>>({
        ...API_ENDPOINTS.kyc.submit,
        data: payload,
      }),
    ...options,
  });

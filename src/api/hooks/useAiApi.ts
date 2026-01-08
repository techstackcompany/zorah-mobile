import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";

type AskAiRequest = {
  message: string;
};

type AskAiResponse = {
  status: string;
  reply: string;
  intent?: string;
};

type TranscribeExpenseResponse = {
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

export const useAskAiMutation = (
  options?: UseMutationOptions<AskAiResponse, ApiError, AskAiRequest>,
) =>
  useMutation<AskAiResponse, ApiError, AskAiRequest>({
    mutationKey: ["ai", "ask"],
    mutationFn: (payload) =>
      apiRequest<AskAiResponse>({
        ...API_ENDPOINTS.ai.ask,
        data: payload,
      }),
    ...options,
  });

export const useTranscribeExpenseMutation = (
  options?: UseMutationOptions<TranscribeExpenseResponse, ApiError, FormData>,
) =>
  useMutation<TranscribeExpenseResponse, ApiError, FormData>({
    mutationKey: ["ai", "transcribeExpense"],
    mutationFn: (formData) =>
      apiRequest<TranscribeExpenseResponse>({
        ...API_ENDPOINTS.ai.transcribeExpense,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    ...options,
  });

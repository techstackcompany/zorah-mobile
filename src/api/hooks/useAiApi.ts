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
        method: API_ENDPOINTS.ai.ask.method,
        url: API_ENDPOINTS.ai.ask.path,
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
        method: API_ENDPOINTS.ai.transcribeExpense.method,
        url: API_ENDPOINTS.ai.transcribeExpense.path,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    ...options,
  });

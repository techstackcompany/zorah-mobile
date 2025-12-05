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

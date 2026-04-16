import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiError, apiRequest, baseClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

type FinancialTipsApiResponse = {
  reply?: string;
  status?: string;
  result?: string;
  tip?: string;
};

export type FinancialTipResponse = {
  status: string;
  reply: string;
  tip: string;
  tips: string[];
};

const sanitizeTipLine = (line: string) =>
  line
    .replace(/^\d+\.\s*/, "")
    .replace(/\*\*/g, "")
    .trim();

const extractTipsFromReply = (reply: string) =>
  reply
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map(sanitizeTipLine)
    .filter(Boolean);

export const useGetFinancialTipQuery = (
  options?: UseQueryOptions<FinancialTipResponse, ApiError>,
) =>
  useQuery<FinancialTipResponse, ApiError>({
    queryKey: ["financial-tip"],
    queryFn: async () => {
      const response = await apiRequest<FinancialTipsApiResponse>(
        {
          ...API_ENDPOINTS.ai.tips,
        },
        baseClient,
      );

      console.log("[AI Tips] /ai/tips response:", response);

      const reply = (response.reply ?? response.tip ?? "").trim();
      const tips = extractTipsFromReply(reply);

      return {
        status: response.status ?? response.result ?? "success",
        reply,
        tip: tips[0] ?? reply,
        tips,
      };
    },
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 3,
    ...options,
  });

import {
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiEnvelope, Category, CategoryType } from "../types";

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

export const useGetCategoriesQuery = (
  type: CategoryType,
  options?: QueryOptions<Category>,
) =>
  useQuery<ApiEnvelope<Category>, ApiError>({
    queryKey: ["categories", type],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.categories.getCategories(type);
      const response = await apiRequest<ApiEnvelope<Category>>({
        method: endpoint.method,
        url: endpoint.path,
      });
      return response;
    },
    ...options,
  });


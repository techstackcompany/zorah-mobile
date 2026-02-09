import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  CategoryItem,
  CategoryResponseItem,
  CategoryType,
} from "../types";

export const useGetCategoriesQuery = (
  type: CategoryType,
  options?: UseQueryOptions<CategoryItem[], ApiError>,
) =>
  useQuery<CategoryItem[], ApiError>({
    queryKey: ["categories", type],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.categories.getCategories(type);
      const response = await apiRequest<
        ApiEnvelope<{ subcategories: CategoryResponseItem[] }>
      >({
        ...endpoint,
      });
      console.log("response.data", response.data);
      return (
        response.data?.subcategories.map(
          ({ _id, image, name }: CategoryResponseItem) => ({
            key: _id,
            icon: image,
            label: name.toLowerCase(),
          }),
        ) || []
      );
    },
    ...options,
  });

export const useGetAllCategoriesQuery = (
  options?: UseQueryOptions<CategoryItem[], ApiError>,
) => 
  useQuery<CategoryItem[], ApiError>({
    queryKey: ["categories", "subcategories"],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.categories.getAllCategories;
      const response = await apiRequest<
        { data: CategoryResponseItem[] }
      >({
        ...endpoint,
      });
      return (
        response.data.map(
          ({ _id, image, name }: CategoryResponseItem) => ({
            key: _id,
            icon: image,
            label: name.toLowerCase(),
          }),
        ) || []
      );
    },
    ...options,
  });


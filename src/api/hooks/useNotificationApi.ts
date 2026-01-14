import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  Notification,
  RegisterNotificationTokenRequest,
} from "../types";

export const useGetNotificationsQuery = (
  options?: UseQueryOptions<Notification[], ApiError>,
) =>
  useQuery<Notification[], ApiError>({
    queryKey: ["notifications", "list"],
    queryFn: () =>
      apiRequest<Notification[]>({
        ...API_ENDPOINTS.notifications.getNotifications,
      }),
    ...options,
  });

export const useReadNotificationMutation = (
  options?: UseMutationOptions<
    Notification,
    ApiError,
    { notificationId: string }
  >,
) =>
  useMutation<Notification, ApiError, { notificationId: string }>({
    mutationKey: ["notifications", "read"],
    mutationFn: ({ notificationId }) => {
      const endpoint =
        API_ENDPOINTS.notifications.readNotification(notificationId);
      return apiRequest<Notification>({
        ...endpoint,
      });
    },
    ...options,
  });

export const useRegisterNotificationTokenMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<unknown>,
    ApiError,
    RegisterNotificationTokenRequest
  >,
) =>
  useMutation<ApiEnvelope<unknown>, ApiError, RegisterNotificationTokenRequest>(
    {
      mutationKey: ["notifications", "registerToken"],
      mutationFn: (payload) =>
        apiRequest<ApiEnvelope<unknown>>({
          ...API_ENDPOINTS.notifications.registerToken,
          data: payload,
        }),
      ...options,
    },
  );


















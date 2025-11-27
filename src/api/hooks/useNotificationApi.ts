import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  Notification,
  RegisterNotificationTokenRequest,
  SendTestNotificationRequest,
} from "../types";

export const useGetNotificationsQuery = (
  options?: UseQueryOptions<ApiEnvelope<Notification[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<Notification[]>, ApiError>({
    queryKey: ["notifications", "list"],
    queryFn: () =>
      apiRequest<ApiEnvelope<Notification[]>>({
        method: API_ENDPOINTS.notifications.getNotifications.method,
        url: API_ENDPOINTS.notifications.getNotifications.path,
      }),
    ...options,
  });

export const useReadNotificationMutation = (
  options?: UseMutationOptions<ApiEnvelope<Notification>, ApiError, { notificationId: string }>,
) =>
  useMutation<
    ApiEnvelope<Notification>,
    ApiError,
    { notificationId: string }
  >({
    mutationKey: ["notifications", "read"],
    mutationFn: ({ notificationId }) => {
      const endpoint =
        API_ENDPOINTS.notifications.readNotification(notificationId);
      return apiRequest<ApiEnvelope<Notification>>({
        method: endpoint.method,
        url: endpoint.path,
      });
    },
    ...options,
  });

export const useRegisterNotificationTokenMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, RegisterNotificationTokenRequest>,
) =>
  useMutation<
    ApiEnvelope<unknown>,
    ApiError,
    RegisterNotificationTokenRequest
  >({
    mutationKey: ["notifications", "registerToken"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.notifications.registerToken.method,
        url: API_ENDPOINTS.notifications.registerToken.path,
        data: payload,
      }),
    ...options,
  });

export const useSendTestNotificationMutation = (
  options?: UseMutationOptions<ApiEnvelope<unknown>, ApiError, SendTestNotificationRequest>,
) =>
  useMutation<
    ApiEnvelope<unknown>,
    ApiError,
    SendTestNotificationRequest
  >({
    mutationKey: ["notifications", "sendTest"],
    mutationFn: (payload) =>
      apiRequest<ApiEnvelope<unknown>>({
        method: API_ENDPOINTS.notifications.sendTestNotification.method,
        url: API_ENDPOINTS.notifications.sendTestNotification.path,
        data: payload,
      }),
    ...options,
  });

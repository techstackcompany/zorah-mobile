import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { apiRequest, ApiError } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  ApiEnvelope,
  Notification,
  RegisterNotificationTokenRequest,
  SendTestNotificationRequest,
} from "../types";

type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<ApiEnvelope<TData>, ApiError, ApiEnvelope<TData>, TQueryKey>,
  "queryKey" | "queryFn"
>;

type MutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<ApiEnvelope<TData>, ApiError, TVariables>,
  "mutationFn"
>;

export const useGetNotificationsQuery = (
  options?: QueryOptions<Notification[]>,
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
  options?: MutationOptions<Notification, { notificationId: string }>,
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
  options?: MutationOptions<unknown, RegisterNotificationTokenRequest>,
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
  options?: MutationOptions<unknown, SendTestNotificationRequest>,
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

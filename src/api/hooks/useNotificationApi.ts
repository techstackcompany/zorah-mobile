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
  SendTestNotificationRequest,
} from "../types";

export const useGetNotificationsQuery = (
  options?: UseQueryOptions<ApiEnvelope<Notification[]>, ApiError>,
) =>
  useQuery<ApiEnvelope<Notification[]>, ApiError>({
    queryKey: ["notifications", "list"],
    queryFn: () =>
      apiRequest<ApiEnvelope<Notification[]>>({
        ...API_ENDPOINTS.notifications.getNotifications,
      }),
    ...options,
  });

export const useReadNotificationMutation = (
  options?: UseMutationOptions<
    ApiEnvelope<Notification>,
    ApiError,
    { notificationId: string }
  >,
) =>
  useMutation<ApiEnvelope<Notification>, ApiError, { notificationId: string }>({
    mutationKey: ["notifications", "read"],
    mutationFn: ({ notificationId }) => {
      const endpoint =
        API_ENDPOINTS.notifications.readNotification(notificationId);
      return apiRequest<ApiEnvelope<Notification>>({
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

// export const useSendTestNotificationMutation = (
//   options?: UseMutationOptions<
//     ApiEnvelope<unknown>,
//     ApiError,
//     SendTestNotificationRequest
//   >,
// ) =>
//   useMutation<ApiEnvelope<unknown>, ApiError, SendTestNotificationRequest>({
//     mutationKey: ["notifications", "sendTest"],
//     mutationFn: (payload) =>
//       apiRequest<ApiEnvelope<unknown>>({
//         ...API_ENDPOINTS.notifications.sendTestNotification,
//         data: payload,
//       }),
//     ...options,
//   });

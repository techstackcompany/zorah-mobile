import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ApiError, apiRequest } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  AddBillReminderRequest,
  GetBillRemindersResponse,
  PayBillReminderResponse,
  UpdateBillReminderRequest,
  UpdateBillReminderResponse,
} from "../types";

export const useGetBillsQuery = (
  options?: UseQueryOptions<GetBillRemindersResponse>,
) =>
  useQuery({
    queryKey: ["billReminders"],
    queryFn: async () => {
      return apiRequest<GetBillRemindersResponse>({
        ...API_ENDPOINTS.billReminders.getBills,
      });
    },
    ...options,
  });

export const usePayBillMutation = (
  billId: string,
  options?: UseMutationOptions<PayBillReminderResponse, ApiError>,
) =>
  useMutation({
    mutationKey: ["markBillAsPaid", billId],
    mutationFn: async () => {
      return apiRequest<PayBillReminderResponse>({
        ...API_ENDPOINTS.billReminders.payBill(billId),
      });
    },
    ...options,
  });

export const useAddBillReminderMutation = (
  options?: UseMutationOptions<
    AddBillReminderRequest,
    ApiError,
    AddBillReminderRequest
  >,
) =>
  useMutation<AddBillReminderRequest, ApiError, AddBillReminderRequest>({
    mutationKey: ["addBillReminder"],
    mutationFn: (body) =>
      apiRequest<AddBillReminderRequest>({
        ...API_ENDPOINTS.billReminders.addBill,
        data: body,
      }),
    ...options,
  });

export const useUpdateBillReminderMutation = (
  billId: string,
  options?: UseMutationOptions<
    UpdateBillReminderResponse,
    ApiError,
    UpdateBillReminderRequest
  >,
) =>
  useMutation<UpdateBillReminderResponse, ApiError, UpdateBillReminderRequest>({
    mutationKey: ["updateBillReminder", billId],
    mutationFn: (body) =>
      apiRequest<UpdateBillReminderResponse>({
        ...API_ENDPOINTS.billReminders.updateBill(billId),
        data: body,
      }),
    ...options,
  });

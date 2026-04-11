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
  ApiEnvelope,
  GetBillRemindersResponse,
  PayBillReminderResponse,
  UpdateBillReminderRequest,
  UpdateBillReminderResponse,
} from "../types";

export const useGetBillsQuery = (
  options?: UseQueryOptions<GetBillRemindersResponse, ApiError>,
) =>
  useQuery<GetBillRemindersResponse, ApiError>({
    queryKey: ["billReminders"],
    queryFn: async () => {
      const response = await apiRequest<
        GetBillRemindersResponse | ApiEnvelope<GetBillRemindersResponse>
      >({
        ...API_ENDPOINTS.billReminders.getBills,
      });

      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        response.data
      ) {
        const data = response.data as GetBillRemindersResponse;
        return {
          summary: {
            totalMonthly: data.summary?.totalMonthly ?? 0,
            totalPaid: data.summary?.totalPaid ?? 0,
            totalDue: data.summary?.totalDue ?? 0,
          },
          bills: Array.isArray(data.bills) ? data.bills : [],
        };
      }

      const data = response as GetBillRemindersResponse;
      return {
        summary: {
          totalMonthly: data?.summary?.totalMonthly ?? 0,
          totalPaid: data?.summary?.totalPaid ?? 0,
          totalDue: data?.summary?.totalDue ?? 0,
        },
        bills: Array.isArray(data?.bills) ? data.bills : [],
      };
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

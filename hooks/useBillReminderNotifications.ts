import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/auth-context/useSession";
import { useGetUserProfileQuery } from "@/src/api/hooks";
import { BillReminder, GetBillRemindersResponse } from "@/src/api/types";
import {
  cancelBillReminder,
  getBillLeadDays,
  readNotificationMap,
  scheduleBillReminder,
} from "@/lib/localNotifications";

export async function syncBillReminders(
  bills: BillReminder[],
  preferredHour: number,
) {
  const map = await readNotificationMap();
  const currentBillIds = new Set(bills.map((b) => b._id));

  for (const bill of bills) {
    if (bill.reminderEnabled && bill.status !== "paid") {
      const leadDays = await getBillLeadDays(bill._id);

      await cancelBillReminder(bill._id);

      await scheduleBillReminder({
        billId: bill._id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        preferredHour,
        leadDays,
      });
    } else {
      await cancelBillReminder(bill._id);
    }
  }

  for (const billId of Object.keys(map)) {
    if (!currentBillIds.has(billId)) {
      await cancelBillReminder(billId);
    }
  }
}

export function useBillReminderNotifications() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();
  const { data: userData } = useGetUserProfileQuery();

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const safeUser = (userData ?? {}) as Record<string, any>;
  const preferredHour =
    typeof safeUser.preferredReminderHour === "number"
      ? safeUser.preferredReminderHour
      : 9;

  const runSync = () => {
    if (!isAuthenticated) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      const data = queryClient.getQueryData<GetBillRemindersResponse>([
        "billReminders",
      ]);
      if (data && Array.isArray(data.bills)) {
        await syncBillReminders(data.bills, preferredHour);
      }
    }, 300);
  };

  useEffect(() => {
    runSync();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        runSync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // 2. Sync on user profile changes (preferredHour dependency)
  useEffect(() => {
    runSync();
  }, [preferredHour]);

  // 3. Subscribe to React Query cache changes for key ["billReminders"]
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.query.queryKey[0] === "billReminders" &&
        event.type === "updated" &&
        event.action.type === "success"
      ) {
        runSync();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, isAuthenticated, preferredHour]);
}

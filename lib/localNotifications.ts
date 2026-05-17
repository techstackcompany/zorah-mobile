import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { formatLongDate, formatNairaCurrency } from "./utils";

export const BILL_NOTIFICATION_IDS_KEY = "@bill_notification_ids";
export const BILL_LEAD_DAYS_KEY = "@bill_lead_days";

export type BillNotificationVariant = "lead" | "due";

export interface ScheduleBillReminderInput {
  billId: string;
  name: string;
  amount: number;
  dueDate: string; 
  preferredHour: number; // 0–23
  leadDays?: number; 
}

export async function readNotificationMap(): Promise<Record<string, string[]>> {
  try {
    const data = await AsyncStorage.getItem(BILL_NOTIFICATION_IDS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to read notification map", error);
    return {};
  }
}

export async function writeNotificationMap(map: Record<string, string[]>): Promise<void> {
  try {
    await AsyncStorage.setItem(BILL_NOTIFICATION_IDS_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to write notification map", error);
  }
}

export async function getBillLeadDays(billId: string): Promise<number | undefined> {
  try {
    const data = await AsyncStorage.getItem(BILL_LEAD_DAYS_KEY);
    if (!data) return undefined;
    const map: Record<string, number> = JSON.parse(data);
    return map[billId];
  } catch (error) {
    console.error("Failed to read lead days", error);
    return undefined;
  }
}

export async function setBillLeadDays(billId: string, days: number): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(BILL_LEAD_DAYS_KEY);
    const map: Record<string, number> = data ? JSON.parse(data) : {};
    map[billId] = days;
    await AsyncStorage.setItem(BILL_LEAD_DAYS_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to set lead days", error);
  }
}

export async function clearBillLeadDays(billId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(BILL_LEAD_DAYS_KEY);
    if (!data) return;
    const map: Record<string, number> = JSON.parse(data);
    delete map[billId];
    await AsyncStorage.setItem(BILL_LEAD_DAYS_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to clear lead days", error);
  }
}

export async function cancelBillReminder(billId: string): Promise<void> {
  try {
    const map = await readNotificationMap();
    const ids = map[billId];
    if (ids && ids.length > 0) {
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
    delete map[billId];
    await writeNotificationMap(map);
  } catch (error) {
    console.error("Failed to cancel bill reminder", error);
  }
}

export async function cancelAllBillReminders(): Promise<void> {
  try {
    const map = await readNotificationMap();
    for (const ids of Object.values(map)) {
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
    await AsyncStorage.removeItem(BILL_NOTIFICATION_IDS_KEY);
  } catch (error) {
    console.error("Failed to cancel all bill reminders", error);
  }
}

export async function scheduleBillReminder(input: ScheduleBillReminderInput): Promise<string[]> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      return [];
    }

    const { billId, name, amount, dueDate, preferredHour, leadDays = 1 } = input;
    const dueTime = new Date(dueDate);
    if (isNaN(dueTime.getTime())) {
      return [];
    }

    const scheduledIds: string[] = [];

    // Schedule Lead Notification
    if (leadDays > 0) {
      const leadTime = new Date(dueTime);
      leadTime.setDate(leadTime.getDate() - leadDays);
      leadTime.setHours(preferredHour, 0, 0, 0);

      if (leadTime.getTime() > Date.now()) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Upcoming bill: ${name}`,
            body: `Due ${formatLongDate(dueTime)} — ${formatNairaCurrency(amount)}. Tap to review.`,
            data: { type: "bill-reminder", billId, variant: "lead" },
          },
          trigger: leadTime,
        });
        scheduledIds.push(id);
      }
    }

    // Schedule Due-day Notification
    const exactDueTime = new Date(dueTime);
    exactDueTime.setHours(preferredHour, 0, 0, 0);

    if (exactDueTime.getTime() > Date.now()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${name} is due today`,
          body: `${formatNairaCurrency(amount)} — tap to mark as paid.`,
          data: { type: "bill-reminder", billId, variant: "due" },
        },
        trigger: exactDueTime,
      });
      scheduledIds.push(id);
    }

    if (scheduledIds.length > 0) {
      const map = await readNotificationMap();
      map[billId] = scheduledIds;
      await writeNotificationMap(map);
    }

    return scheduledIds;
  } catch (error) {
    console.error("Failed to schedule bill reminder", error);
    return [];
  }
}

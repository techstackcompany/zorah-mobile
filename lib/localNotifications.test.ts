import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  scheduleBillReminder,
  cancelBillReminder,
  cancelAllBillReminders,
  readNotificationMap,
  writeNotificationMap,
  BILL_NOTIFICATION_IDS_KEY,
} from "./localNotifications";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}));

describe("localNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    
    // Simulate empty map
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const getFutureDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString();
  };
  
  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  it("1. scheduleBillReminder returns 2 IDs for a bill with future lead-day and due-day", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce("id-lead")
      .mockResolvedValueOnce("id-due");

    const ids = await scheduleBillReminder({
      billId: "bill-1",
      name: "Test Bill",
      amount: 1000,
      dueDate: getFutureDate(5),
      preferredHour: 9,
      leadDays: 1,
    });

    expect(ids).toHaveLength(2);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      BILL_NOTIFICATION_IDS_KEY,
      JSON.stringify({ "bill-1": ["id-lead", "id-due"] })
    );
  });

  it("2. Returns 1 ID when lead-day is in the past but due-day is future", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce("id-due");

    // Due in 12 hours -> Lead day (24h ago) is in the past
    const d = new Date();
    d.setHours(d.getHours() + 12);

    const ids = await scheduleBillReminder({
      billId: "bill-2",
      name: "Test Bill 2",
      amount: 1000,
      dueDate: d.toISOString(),
      preferredHour: 9,
      leadDays: 1,
    });

    expect(ids).toHaveLength(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it("3. Returns 0 IDs when due-day is in the past", async () => {
    const ids = await scheduleBillReminder({
      billId: "bill-3",
      name: "Test Bill 3",
      amount: 1000,
      dueDate: getPastDate(2),
      preferredHour: 9,
      leadDays: 1,
    });

    expect(ids).toHaveLength(0);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(0);
  });

  it("4. Returns 0 IDs when permission is not granted", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const ids = await scheduleBillReminder({
      billId: "bill-4",
      name: "Test Bill 4",
      amount: 1000,
      dueDate: getFutureDate(5),
      preferredHour: 9,
      leadDays: 1,
    });

    expect(ids).toHaveLength(0);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(0);
  });

  it("5. cancelBillReminder cancels every ID in the map for that billId and removes the entry", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ "bill-5": ["id-1", "id-2"], "bill-6": ["id-3"] })
    );

    await cancelBillReminder("bill-5");

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("id-1");
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("id-2");

    // Should rewrite map without bill-5
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      BILL_NOTIFICATION_IDS_KEY,
      JSON.stringify({ "bill-6": ["id-3"] })
    );
  });

  it("6. cancelAllBillReminders clears the entire map", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ "bill-5": ["id-1", "id-2"], "bill-6": ["id-3"] })
    );

    await cancelAllBillReminders();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(3);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(BILL_NOTIFICATION_IDS_KEY);
  });

  it("7. leadDays = 0 schedules only the due-day notification", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce("id-due");

    const ids = await scheduleBillReminder({
      billId: "bill-7",
      name: "Test Bill 7",
      amount: 1000,
      dueDate: getFutureDate(5),
      preferredHour: 9,
      leadDays: 0,
    });

    expect(ids).toHaveLength(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });
});

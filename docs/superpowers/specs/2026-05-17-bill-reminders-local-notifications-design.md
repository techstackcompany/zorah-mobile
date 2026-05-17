# Bill Reminders — Local Notifications

**Date:** 2026-05-17
**Owner:** Akeem Mudashiru
**Status:** Approved for implementation
**Implementer:** Handed off to another LLM agent

---

## 1. Goal

Deliver on-device local notifications for bill reminders so users get notified before their bills are due, without requiring backend support. This is the highest-value notification use case in Zorah (bills are time-sensitive and already user-configured).

Scope is intentionally narrow: **one-shot local notifications per bill, scheduled and cancelled entirely on the client**. Recurring bills are handled by the existing backend pattern (server creates the next bill record after `markAsPaid`); each generated record gets its own one-shot reminder. No backend changes required.

## 2. Non-Goals

- Server-driven push notifications for bills (out of scope; existing FCM token registration stays untouched).
- Per-device sync of scheduled reminders (a fresh login on a new device backfills via a sync routine, but multi-device delivery is not guaranteed).
- Notifications for budgets, savings, FX rates, etc. (separate features).
- Web/desktop notifications.
- Snooze/dismiss-from-notification actions.

## 3. Behavior Specification

### 3.1 Reminder schedule

For each bill where `reminderEnabled === true` and `status !== "paid"` and `dueDate` is in the future:

- **Default:** schedule **two** local notifications:
  1. **Lead notification** — 1 day before `dueDate`, at the user's `preferredReminderHour` (defaults to 9 if unset).
  2. **Due-day notification** — on `dueDate` itself, at `preferredReminderHour`.
- **Per-bill override:** if the bill has `reminderLeadDays` set (new optional field, see §5.2), use that value for the lead notification instead of 1. `reminderLeadDays = 0` means only the due-day notification fires. The override is client-only metadata for v1 (stored in AsyncStorage keyed by bill ID); we do not block on backend support.
- If the resulting scheduled time is already in the past (e.g. lead day is yesterday), skip that specific notification only. Still schedule the due-day one if it's in the future.
- If `dueDate` itself is already past, schedule nothing.

### 3.2 Notification content

| Notification | Title | Body | Channel (Android) |
|---|---|---|---|
| Lead | `Upcoming bill: {bill.name}` | `Due {formatLongDate(dueDate)} — {formatNairaCurrency(amount)}. Tap to review.` | `warning` |
| Due-day | `{bill.name} is due today` | `{formatNairaCurrency(amount)} — tap to mark as paid.` | `critical` |

Use existing helpers from `lib/utils.ts` (`formatLongDate`, `formatNairaCurrency`).

Each notification carries a `data` payload:
```ts
{ type: "bill-reminder", billId: string, variant: "lead" | "due" }
```

### 3.3 Tap behavior (deep link)

Tapping a notification opens `/(app)/bill-reminder/update-bill?billId={billId}`. The existing `UpdateBillScreen` is the de-facto detail screen; if the user lands there for a paid/deleted bill, the screen should show a graceful "Bill not found" empty state (verify in implementation; add if missing).

Cold-start vs warm-start:
- **Warm start:** handled by `Notifications.addNotificationResponseReceivedListener` in `PushNotificationsProvider`.
- **Cold start:** read `Notifications.getLastNotificationResponseAsync()` on app mount and route accordingly *after* auth guard resolves (i.e. only if `isAuthenticated`).

### 3.4 Lifecycle — when notifications are (re)scheduled or cancelled

| Trigger | Action |
|---|---|
| Add bill (`useAddBillReminderMutation` `onSuccess`) | Schedule per §3.1 if `reminderEnabled` and `dueDate` future. |
| Update bill (`useUpdateBillReminderMutation` `onSuccess`) | Cancel any existing notifications for `billId`, then re-schedule if applicable. |
| Mark bill paid (`usePayBillMutation` `onSuccess`) | Cancel all notifications for `billId`. |
| Card toggle "Reminder" switch | Call `useUpdateBillReminderMutation` with `{ reminderEnabled: value }`. Lifecycle above takes over. |
| Change `preferredReminderHour` (existing `useUpdateProfileMutation`) | Re-sync all bills (see §3.5). |
| App foreground / authenticated app mount | Run sync routine (see §3.5). |
| Sign out | Cancel **all** scheduled notifications (`cancelAllScheduledNotificationsAsync`) and clear ID map. |
| Permission denied or revoked | Skip scheduling silently; surface a one-time Toast on first attempt only. |

### 3.5 Sync routine (`syncBillReminders`)

A function that reconciles scheduled local notifications with the current bill list. Runs:

- On app foreground (via `AppState` listener inside the bills sync hook).
- On `(app)/_layout.tsx` mount, after user profile fetch resolves.
- After `preferredReminderHour` change.

Algorithm:
1. Read `bills` from React Query cache for key `["billReminders"]`. If not present, do nothing (next manual fetch will trigger re-sync via React Query's invalidate flow).
2. Read AsyncStorage map `@bill_notification_ids: Record<billId, string[]>`.
3. For each bill currently in the list with `reminderEnabled && status !== "paid"`:
   - Cancel any previously scheduled IDs for that bill (`cancelScheduledNotificationAsync` for each).
   - Re-schedule per §3.1.
   - Store the new IDs in the map.
4. For each `billId` in the map that no longer appears in the bill list (deleted): cancel its notifications, remove from map.
5. Persist the updated map.

This is idempotent — running it multiple times produces the same state. It is the only place that writes the AsyncStorage map.

## 4. Architecture

### 4.1 File layout

```
lib/
  localNotifications.ts          # NEW — pure helpers, no React
hooks/
  useBillReminderNotifications.ts # NEW — orchestrates sync + lifecycle wiring
contexts/
  push-notifications/
    PushNotificationsProvider.tsx # MODIFIED — add iOS permissions + cold-start tap handler
app/
  (app)/
    _layout.tsx                  # MODIFIED — call useBillReminderNotifications()
screens/
  BillReminderScreen.tsx         # MODIFIED — card toggle calls updateBill mutation
  AddBillScreen.tsx              # MODIFIED (small) — pass reminderLeadDays through if user provided
  UpdateBillScreen.tsx           # MODIFIED — handle "bill not found" empty state if missing
src/
  api/
    hooks/
      useBillRemindersApi.ts     # MODIFIED — call notification helpers in mutation onSuccess
      useAuthApi.ts              # MODIFIED — useUpdateProfileMutation onSuccess re-syncs reminders
contexts/
  auth-context/
    SessionProvider.tsx          # MODIFIED — signOut cancels all scheduled notifications
constants/
  storage.ts (or similar)        # MODIFIED — add BILL_NOTIFICATION_IDS_KEY, BILL_LEAD_DAYS_KEY
```

If no central storage-keys file exists, add `BILL_NOTIFICATION_IDS_KEY = "@bill_notification_ids"` and `BILL_LEAD_DAYS_KEY = "@bill_lead_days"` at the top of `lib/localNotifications.ts` and export them.

### 4.2 `lib/localNotifications.ts` — public API

```ts
export type BillNotificationVariant = "lead" | "due";

export interface ScheduleBillReminderInput {
  billId: string;
  name: string;
  amount: number;
  dueDate: string;            // ISO
  preferredHour: number;      // 0–23
  leadDays?: number;          // default 1
}

// Schedules lead + due-day notifications for one bill.
// Returns the notification IDs created (may be 0–2 entries).
export async function scheduleBillReminder(
  input: ScheduleBillReminderInput
): Promise<string[]>;

// Cancels all known notifications for a bill and removes from the ID map.
export async function cancelBillReminder(billId: string): Promise<void>;

// Cancels every bill notification and clears the map. For signOut.
export async function cancelAllBillReminders(): Promise<void>;

// Reads the per-bill lead-days override map.
export async function getBillLeadDays(billId: string): Promise<number | undefined>;
export async function setBillLeadDays(billId: string, days: number): Promise<void>;
export async function clearBillLeadDays(billId: string): Promise<void>;

// Internal but exported for testability:
export async function readNotificationMap(): Promise<Record<string, string[]>>;
export async function writeNotificationMap(map: Record<string, string[]>): Promise<void>;
```

All functions are async and swallow `expo-notifications` errors (logging them), so failures never crash mutations. Each function checks permission via `Notifications.getPermissionsAsync()` before scheduling; if not granted, `scheduleBillReminder` returns `[]` without throwing.

### 4.3 `hooks/useBillReminderNotifications.ts`

Single hook called once from `app/(app)/_layout.tsx`. Responsibilities:

1. On mount and on `AppState` change to `"active"`: call `syncBillReminders(bills, preferredHour)`.
2. Subscribe to React Query cache changes for key `["billReminders"]` — when bills data updates, run sync. (Use `queryClient.getQueryCache().subscribe(...)` with a filter on the key.)
3. Subscribe to user profile changes for `preferredReminderHour` — when it changes, run sync.
4. Returns nothing.

Sync logic lives inline in the hook (calls the helpers in `lib/localNotifications.ts`).

### 4.4 Mutation wiring (`src/api/hooks/useBillRemindersApi.ts`)

Each mutation's `onSuccess` already invalidates the `["billReminders"]` query. After invalidation, the React Query subscriber inside `useBillReminderNotifications` will see fresh data and re-sync — **so we do not need to call schedule/cancel helpers directly from the mutations.** This keeps the API hooks pure.

Exception: `usePayBillMutation` should also call `cancelBillReminder(billId)` synchronously in `onSuccess` so the user doesn't get a now-stale "due today" notification fire during the brief gap before sync runs.

### 4.5 Permissions (`PushNotificationsProvider.tsx`)

The current effect is Android-only. Refactor `requestPermissionsAndGetToken` so:

- Permission request runs on **both** iOS and Android (use `Notifications.requestPermissionsAsync` regardless of platform).
- FCM token fetch (`getDevicePushTokenAsync`) remains Android-only (unchanged behavior).
- Add an iOS notification category if desired (not required for v1 since we have no actions).
- Replace the `alert(...)` on permission denial with a Toast; do not block the rest of the provider.
- Add `getLastNotificationResponseAsync()` handling on mount: if the response payload is a `bill-reminder`, route via `router.replace("/(app)/bill-reminder/update-bill?billId=" + billId)` *after* a small `setTimeout` to allow the root navigator to mount. Only route if `isAuthenticated`.

### 4.6 Sign-out cleanup (`SessionProvider.tsx`)

In `signOut`, before clearing storage, call `cancelAllBillReminders()`. Wrap in try/catch; do not let it block sign-out.

## 5. Data Model Changes

### 5.1 Backend types

**No backend changes.** `BillReminder.reminderEnabled` already exists; `preferredReminderHour` already exists on user profile. The recurrence story is already covered by the backend creating the next bill after `markAsPaid`.

### 5.2 Client-only addition: `reminderLeadDays`

Add an optional per-bill lead-time override stored client-side in AsyncStorage under `@bill_lead_days: Record<billId, number>`. Surface in `AddBillScreen` and `UpdateBillScreen` as an optional control labelled "Notify me X days before" with values `[0, 1, 2, 3, 7]`. Default selection is 1.

This is intentionally **not** sent to the backend in v1. If/when backend adds the field, migrate by reading from AsyncStorage on first launch with the new API and posting an update.

## 6. Permissions UX

- First-time permission prompt happens on app launch (existing flow, now iOS-inclusive).
- If denied: scheduling silently no-ops. On the first `scheduleBillReminder` call after denial, show a one-time Toast: `"Enable notifications in Settings to get bill reminders"` with a "Settings" action that calls `Linking.openSettings()`. Track "already shown" in AsyncStorage so we don't nag.
- No separate in-app permission screen for v1.

## 7. Edge Cases

| Case | Handling |
|---|---|
| `dueDate` already past at create-time | Schedule nothing. |
| Lead time would land in the past, but due-day is future | Schedule only due-day. |
| User changes `preferredReminderHour` while a bill's lead time is "today, earlier" | Re-sync may produce a past time for that bill's lead; skip it. |
| User adds 100 bills in a row | Each `onSuccess` invalidates query, which re-fires the cache subscriber. Debounce sync runs by 300ms to coalesce. |
| Bill deleted on another device (no longer in list after refetch) | Sync routine removes its scheduled notifications during the "deleted" pass. |
| Permission revoked mid-session | Next sync run detects via `getPermissionsAsync`; all scheduled notifications get cancelled by the OS automatically. We do not refire prompts. |
| User signed out with bills still queued | `signOut` cancels everything. |
| App killed before scheduling completes | Scheduling is OS-persistent — once `scheduleNotificationAsync` resolves, the OS holds it. Worst case: a notification IDs map entry is missing, sync corrects it. |
| Two devices logged into same account | Both schedule independently. User may get duplicate notifications on different devices. Documented as a known v1 limitation. |
| `preferredReminderHour` is null/undefined | Default to 9. |
| Timezone change (user travels) | Notifications fire at the wall-clock time scheduled; iOS/Android handle TZ. Acceptable for v1. |

## 8. Testing Strategy

The project has no test suite (documented in CLAUDE.md §10). We add the first one with this feature, scoped to `lib/localNotifications.ts` only — pure functions, easy to test with `jest` + a mock for `expo-notifications`.

**Required tests (`lib/localNotifications.test.ts`):**

1. `scheduleBillReminder` returns 2 IDs for a bill with future lead-day and due-day.
2. Returns 1 ID when lead-day is in the past but due-day is future.
3. Returns 0 IDs when due-day is in the past.
4. Returns 0 IDs when permission is not granted.
5. `cancelBillReminder` cancels every ID in the map for that billId and removes the entry.
6. `cancelAllBillReminders` clears the entire map.
7. `leadDays = 0` schedules only the due-day notification.

**Manual QA checklist** (for the implementer to verify on a physical iOS device — simulator does not fire local notifications reliably):

- [ ] Fresh install, accept permission, create bill due tomorrow with `reminderEnabled = true`. Verify both notifications appear in OS settings/scheduled list (use `Notifications.getAllScheduledNotificationsAsync` debug log).
- [ ] Edit the bill's amount; old notifications gone, new ones present.
- [ ] Mark bill as paid; notifications cancelled.
- [ ] Toggle reminder off via the card switch; notifications cancelled.
- [ ] Change `preferredReminderHour` to a different hour; verify rescheduling.
- [ ] Sign out; verify zero scheduled notifications remain.
- [ ] Deny permission, create a bill; verify Toast appears once.
- [ ] Tap a fired notification; verify deep link to `update-bill?billId=...`.
- [ ] Cold-start tap (kill app, tap notification from lock screen); verify same deep link after auth.

## 9. Rollout

Single PR, no feature flag. The feature is additive — users who don't enable reminders see no change. Behind-the-scenes work (iOS permission prompt) is the only globally visible change; gate that behind a check that we haven't already asked, to avoid prompting all existing users on update.

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `expo-notifications` permission re-prompt on app update annoys existing users | Check `getPermissionsAsync` first; only prompt if `status === "undetermined"`. |
| Sync routine fires too often and thrashes scheduling | 300ms debounce; sync is idempotent so duplicate runs are safe. |
| AsyncStorage corruption leaves stale IDs | Sync routine reconciles every run; stale IDs get cancelled by `cancelScheduledNotificationAsync` (no-op if already fired) and dropped from map. |
| User in different timezone than when scheduled | OS handles wall-clock scheduling; acceptable for v1. |
| iOS Background App Refresh disabled | Local notifications still fire (scheduled at OS level). No impact. |
| `update-bill` route doesn't accept `billId` query param | Verify and fix during implementation; trivial change. |

## 11. Out of Scope (Future Work)

- Notification actions (Mark Paid, Snooze 1hr) — requires iOS notification categories + Android action buttons.
- Server-driven reminders for cross-device consistency.
- Aggregated daily digest ("You have 3 bills due this week").
- Recurring-bill local scheduling (currently relies on backend creating next record).
- Notification preferences screen (per-category opt-out).

## 12. Open Questions

None blocking. Implementer should:
- Confirm `app/(app)/bill-reminder/update-bill.tsx` accepts a `billId` route param; add if missing.
- Decide whether to put the AsyncStorage keys in an existing `constants/` file or inline in `lib/localNotifications.ts` (a quick grep for existing key constants will reveal the convention).

# Code Quality Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove ~70 debug console.log calls, upgrade 9 catch-block logs to console.error, and replace React Native's `Text` with the custom `<Text>` component in `LockScreen.tsx` and `PinSetupScreen.tsx`.

**Architecture:** Three sequential commits — one per category — all mechanical changes with no logic, state, or API modifications. No test suite exists; verify correctness via `npx tsc --noEmit` after each commit.

**Tech Stack:** React Native 0.81, TypeScript (strict), NativeWind (Tailwind), Expo Router, custom `Text` at `components/ui/Text.tsx`

---

## File Map

| File | Change |
|---|---|
| `screens/AccountScreen.tsx` | Remove 2 debug logs |
| `screens/SavingsGoalDetailsScreen.tsx` | Remove 6 debug logs |
| `screens/SavingsGoalAddMoneyScreen.tsx` | Remove 8 debug logs |
| `screens/HomeScreen.tsx` | Remove 2 debug logs |
| `screens/TrackSpendingScreen.tsx` | Remove 4 debug logs |
| `screens/SubmitKycScreen.tsx` | Remove 2 debug logs |
| `screens/FinancialGoalsScreen.tsx` | Remove 1 debug log |
| `hooks/useSetupProgress.ts` | Remove 2 debug logs |
| `hooks/useVoiceTranscriber.ts` | Remove 1 debug log |
| `contexts/push-notifications/PushNotificationsProvider.tsx` | Remove 13 debug logs |
| `screens/BudgetArchiveScreen.tsx` | console.log → console.error |
| `screens/YourBanksScreen.tsx` | console.log → console.error |
| `screens/IncomeDetailsScreen.tsx` | console.log → console.error |
| `screens/AddExpenseScreen.tsx` | console.log → console.error |
| `screens/EditExpenseIncomeScreen.tsx` | console.log → console.error |
| `screens/SignUpScreen.tsx` | console.log → console.error |
| `screens/SignInScreen.tsx` | console.warn → console.error |
| `contexts/settings-context/SettingsProvider.tsx` | console.log → console.error |
| `features/budget/hooks.ts` | 2× console.log → console.error |
| `screens/LockScreen.tsx` | Replace RN Text with custom Text |
| `screens/PinSetupScreen.tsx` | Replace RN Text with custom Text |

---

## Task 1 — Remove debug logs from screens

**Files:** `screens/AccountScreen.tsx`, `screens/SavingsGoalDetailsScreen.tsx`, `screens/SavingsGoalAddMoneyScreen.tsx`, `screens/HomeScreen.tsx`, `screens/TrackSpendingScreen.tsx`, `screens/SubmitKycScreen.tsx`, `screens/FinancialGoalsScreen.tsx`

- [ ] **Step 1: AccountScreen.tsx — remove 2 debug logs**

  Find and delete these two standalone lines (they appear inside a `refreshProfile` callback and just before the return statement):

  ```tsx
  // Line ~145 inside refreshProfile() — delete this line:
  console.log("enabled", enabled);

  // Line ~190 just before the return statement — delete this line:
  console.log("biometricEnabled", biometricsEnabled);
  ```

- [ ] **Step 2: SavingsGoalDetailsScreen.tsx — remove 6 debug logs**

  Find and delete these two blocks (inside the query's `onSuccess` and `onError` callbacks):

  ```tsx
  // Delete this entire block inside onSuccess:
  console.log("====== SAVINGS GOAL DETAIL RESPONSE ======");
  console.log(JSON.stringify(response, null, 2));
  console.log("==========================================");

  // Delete this entire block inside onError:
  console.log("====== SAVINGS GOAL DETAIL ERROR ======");
  console.log(JSON.stringify(error, null, 2));
  console.log("=======================================");
  ```

- [ ] **Step 3: SavingsGoalAddMoneyScreen.tsx — remove 8 debug logs**

  Find and delete these two blocks:

  ```tsx
  // Delete this block inside the onError callback (~lines 85-90):
  console.log("=== CONTRIBUTE TO SAVINGS GOAL ERROR ===");
  console.log("Error object:", error);
  console.log("Error message:", error.message);
  console.log("Error status:", error.status);
  console.log("Error data:", error.data);
  console.log("========================\n");

  // Delete this block inside the submit handler (~lines 129-132):
  console.log("=== CONTRIBUTE TO SAVINGS GOAL REQUEST ===");
  console.log("Payload being sent:", JSON.stringify(payload, null, 2));
  console.log("Payment source:", selectedSource);
  console.log("========================\n");
  ```

- [ ] **Step 4: HomeScreen.tsx — remove 2 debug logs**

  Find and delete:

  ```tsx
  // Inside a useMemo or useEffect (~line 198):
  console.log("month", monthlyExpensesData?.data);

  // Near the bottom of the component body (~line 258):
  console.log("transactionsData", transactionsData);
  ```

- [ ] **Step 5: TrackSpendingScreen.tsx — remove 4 debug logs**

  Find and delete:

  ```tsx
  console.log("expenseSummary", expenseSummary);
  console.log("spendingOverviewData", spendingOverviewData);
  console.log("chartData", chartData);
  console.log("budgets", budgets);
  ```

- [ ] **Step 6: SubmitKycScreen.tsx — remove 2 debug logs**

  Find and delete:

  ```tsx
  console.log("statesError", statesError);
  console.log("statesError", nigerianStates);
  ```

- [ ] **Step 7: FinancialGoalsScreen.tsx — remove 1 debug log**

  Find and delete:

  ```tsx
  console.log("skipped");
  ```

---

## Task 2 — Remove debug logs from hooks and contexts

**Files:** `hooks/useSetupProgress.ts`, `hooks/useVoiceTranscriber.ts`, `contexts/push-notifications/PushNotificationsProvider.tsx`

- [ ] **Step 1: useSetupProgress.ts — remove 2 debug logs**

  Find and delete (these are in the hook body, not in catch blocks):

  ```tsx
  console.log("kycCompleted", kycCompleted);
  console.log("currentStepIndex", steps, currentStepIndex);
  ```

  Do NOT touch lines 22 and 41 — those are `console.error` calls in catch blocks and are correct.

- [ ] **Step 2: useVoiceTranscriber.ts — remove 1 debug log**

  Find and delete (inside the speech recognition result handler):

  ```tsx
  console.log('interimText', interimText)
  ```

  Do NOT touch any `console.error` lines in this file.

- [ ] **Step 3: PushNotificationsProvider.tsx — remove 13 debug logs**

  Delete the following lines. Do NOT touch the `console.error` on line 139 (`"Error getting FCM token:"`).

  ```tsx
  // Inside registerTokenMutation onSuccess:
  console.log("FCM token registered successfully:", response);

  // Inside registerTokenMutation onError:
  console.log("Failed to register FCM token:", error.message);

  // Inside checkIfTokenAlreadyRegistered catch:
  console.log("Error checking registered token:", error);

  // Inside registerToken — all three guard logs:
  console.log("Skipping token registration: User not authenticated");
  console.log("Token registration already attempted");
  console.log("Token already registered, skipping");
  console.log("Registering FCM token with backend:", token);

  // Inside requestPermissionsAndGetToken:
  console.log("Push notification permissions not granted");
  console.log("Push notification permissions granted");
  console.log("FCM Token obtained:", token);
  console.warn("FCM token not available");

  // Inside onTokenRefresh handler:
  console.log("FCM Token refreshed:", newToken);

  // Inside onMessage handler:
  console.log("Foreground notification received:", remoteMessage);

  // Inside onNotificationOpenedApp handler (2 lines):
  console.log(
    "Notification opened app from background:",
    remoteMessage.notification,
  );
  console.log("Notification data:", remoteMessage.data);

  // Inside getInitialNotification handler (2 lines):
  console.log(
    "Notification opened app from quit state:",
    remoteMessage.notification,
  );
  console.log("Notification data:", remoteMessage.data);
  ```

  After removing all logs, two callbacks have unused parameters — rename them to avoid TypeScript strict errors:

  `registerTokenMutation.onSuccess` — `response` is now unused, remove the parameter:
  ```tsx
  // Before:
  onSuccess: async (response) => {
  // After:
  onSuccess: async () => {
  ```

  `registerTokenMutation.onError` — `error` is now unused, remove the parameter:
  ```tsx
  // Before:
  onError: (error) => {
  // After:
  onError: () => {
  ```

  `onNotificationOpenedApp` — `remoteMessage` is now unused, prefix with `_`:
  ```tsx
  // Before:
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
  // After:
  const unsubscribe = messaging().onNotificationOpenedApp((_remoteMessage) => {
  ```

  The `getInitialNotification` block — remove the now-empty `if (remoteMessage)` block entirely:
  ```tsx
  // Before:
  .then((remoteMessage) => {
    if (remoteMessage) {
      // all logs deleted
    }
  });

  // After:
  .then(() => {
    // no-op
  });
  ```

---

## Task 3 — TypeScript check + commit Category 1

- [ ] **Step 1: Run TypeScript check**

  ```bash
  cd /Users/mac/Desktop/pocketMonie && npx tsc --noEmit
  ```

  Expected: no new errors. If errors appear, they are in files touched in Tasks 1–2. Fix before proceeding.

- [ ] **Step 2: Commit**

  ```bash
  git add \
    screens/AccountScreen.tsx \
    screens/SavingsGoalDetailsScreen.tsx \
    screens/SavingsGoalAddMoneyScreen.tsx \
    screens/HomeScreen.tsx \
    screens/TrackSpendingScreen.tsx \
    screens/SubmitKycScreen.tsx \
    screens/FinancialGoalsScreen.tsx \
    hooks/useSetupProgress.ts \
    hooks/useVoiceTranscriber.ts \
    contexts/push-notifications/PushNotificationsProvider.tsx
  git commit -m "chore(cleanup): remove debug console.log calls"
  ```

---

## Task 4 — Upgrade catch-block logs to console.error

**Files:** `screens/BudgetArchiveScreen.tsx`, `screens/YourBanksScreen.tsx`, `screens/IncomeDetailsScreen.tsx`, `screens/AddExpenseScreen.tsx`, `screens/EditExpenseIncomeScreen.tsx`, `screens/SignUpScreen.tsx`, `screens/SignInScreen.tsx`, `contexts/settings-context/SettingsProvider.tsx`, `features/budget/hooks.ts`

- [ ] **Step 1: BudgetArchiveScreen.tsx**

  ```tsx
  // Before:
  console.log("error", error.message);
  // After:
  console.error("error", error.message);
  ```

- [ ] **Step 2: YourBanksScreen.tsx**

  ```tsx
  // Before:
  console.log("_error.message", _error.message);
  // After:
  console.error("_error.message", _error.message);
  ```

- [ ] **Step 3: IncomeDetailsScreen.tsx**

  ```tsx
  // Before:
  console.log("error", error.message);
  // After:
  console.error("error", error.message);
  ```

- [ ] **Step 4: AddExpenseScreen.tsx**

  ```tsx
  // Before:
  console.log("error", error);
  // After:
  console.error("error", error);
  ```

- [ ] **Step 5: EditExpenseIncomeScreen.tsx**

  ```tsx
  // Before:
  console.log("error", error);
  // After:
  console.error("error", error);
  ```

- [ ] **Step 6: SignUpScreen.tsx**

  ```tsx
  // Before:
  console.log("error", error);
  // After:
  console.error("error", error);
  ```

- [ ] **Step 7: SignInScreen.tsx**

  ```tsx
  // Before:
  console.warn(
    "No refresh token in login response - token refresh will not work",
  );
  // After:
  console.error(
    "No refresh token in login response - token refresh will not work",
  );
  ```

- [ ] **Step 8: SettingsProvider.tsx**

  ```tsx
  // Before:
  console.log(error);
  // After:
  console.error(error);
  ```

- [ ] **Step 9: features/budget/hooks.ts — 2 upgrades**

  ```tsx
  // Both occurrences (onError callbacks for deleteBudgetMutation and archiveBudgetMutation):
  // Before:
  console.log("error", error.message);
  // After (apply to both):
  console.error("error", error.message);
  ```

---

## Task 5 — TypeScript check + commit Category 2

- [ ] **Step 1: Run TypeScript check**

  ```bash
  cd /Users/mac/Desktop/pocketMonie && npx tsc --noEmit
  ```

  Expected: no new errors.

- [ ] **Step 2: Commit**

  ```bash
  git add \
    screens/BudgetArchiveScreen.tsx \
    screens/YourBanksScreen.tsx \
    screens/IncomeDetailsScreen.tsx \
    screens/AddExpenseScreen.tsx \
    screens/EditExpenseIncomeScreen.tsx \
    screens/SignUpScreen.tsx \
    screens/SignInScreen.tsx \
    contexts/settings-context/SettingsProvider.tsx \
    features/budget/hooks.ts
  git commit -m "chore(cleanup): upgrade catch-block logs to console.error"
  ```

---

## Task 6 — Replace RN Text with custom Text in LockScreen.tsx

**File:** `screens/LockScreen.tsx`

The custom `Text` component (`components/ui/Text.tsx`) accepts `family` (`"degular"` | `"nunito"`), `weight` (`"regular"` | `"medium"` | `"semibold"` | `"bold"`), `italic`, `className`, and all standard RN `TextProps`. Default `family` is `"nunito"`, default `weight` is `"medium"`.

- [ ] **Step 1: Update the import**

  Remove `Text` from the `react-native` import destructure and add the custom Text import:

  ```tsx
  // Before (in the react-native import block):
  import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,          // ← remove this
    TouchableOpacity,
    View,
  } from "react-native";

  // After:
  import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
  } from "react-native";
  import Text from "@/components/ui/Text";
  ```

- [ ] **Step 2: Replace greeting Text**

  ```tsx
  // Before:
  <Text style={styles.greeting}>Welcome back</Text>

  // After:
  <Text
    family="degular"
    weight="bold"
    className="text-[28px] text-textColor tracking-[0.5px] mb-2"
  >
    Welcome back
  </Text>
  ```

- [ ] **Step 3: Replace subtitle Text**

  ```tsx
  // Before:
  <Text style={styles.subtitle}>Enter your PIN to continue</Text>

  // After:
  <Text weight="regular" className="text-[15px] text-[#6B7280]">
    Enter your PIN to continue
  </Text>
  ```

- [ ] **Step 4: Replace all keypad number Text elements**

  There are 4 occurrences: digits 1–9 in the map, and the standalone "0". Apply the same replacement to all:

  ```tsx
  // Before:
  <Text style={styles.number}>{number}</Text>

  // After:
  <Text weight="semibold" className="text-[28px] text-textColor">
    {number}
  </Text>
  ```

  And for the "0" button:

  ```tsx
  // Before:
  <Text style={styles.number}>0</Text>

  // After:
  <Text weight="semibold" className="text-[28px] text-textColor">
    0
  </Text>
  ```

- [ ] **Step 5: Remove the now-unused StyleSheet entries**

  Delete these three entries from `StyleSheet.create({...})`:

  ```tsx
  // Delete:
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textColor,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "400",
  },
  number: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.textColor,
  },
  ```

---

## Task 7 — Replace RN Text with custom Text in PinSetupScreen.tsx

**File:** `screens/PinSetupScreen.tsx`

- [ ] **Step 1: Update the import**

  ```tsx
  // Before:
  import {
    ActivityIndicator,
    StyleSheet,
    Text,          // ← remove this
    TouchableOpacity,
    View,
  } from "react-native";

  // After:
  import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
  } from "react-native";
  import Text from "@/components/ui/Text";
  ```

- [ ] **Step 2: Replace greeting Text**

  ```tsx
  // Before:
  <Text style={styles.greeting}>
    {step === "create" ? "Create PIN" : "Confirm PIN"}
  </Text>

  // After:
  <Text
    family="degular"
    weight="bold"
    className="text-[28px] text-textColor tracking-[0.5px] mb-2 text-center"
  >
    {step === "create" ? "Create PIN" : "Confirm PIN"}
  </Text>
  ```

- [ ] **Step 3: Replace subtitle Text**

  ```tsx
  // Before:
  <Text style={styles.subtitle}>
    {step === "create"
      ? biometricsAvailable
        ? "Create a 4-digit PIN and enable biometric authentication"
        : "Enter a 4-digit PIN to secure your account"
      : "Re-enter your PIN to confirm"}
  </Text>

  // After:
  <Text weight="regular" className="text-[15px] text-[#6B7280] text-center px-10">
    {step === "create"
      ? biometricsAvailable
        ? "Create a 4-digit PIN and enable biometric authentication"
        : "Enter a 4-digit PIN to secure your account"
      : "Re-enter your PIN to confirm"}
  </Text>
  ```

- [ ] **Step 4: Replace all keypad number Text elements**

  Apply to all keypad digit usages (digits 1–9 in the map, and the standalone "0"):

  ```tsx
  // Before:
  <Text style={styles.number}>{number}</Text>

  // After:
  <Text weight="semibold" className="text-[28px] text-textColor">
    {number}
  </Text>
  ```

  ```tsx
  // Before (the "0" button):
  <Text style={styles.number}>0</Text>

  // After:
  <Text weight="semibold" className="text-[28px] text-textColor">
    0
  </Text>
  ```

- [ ] **Step 5: Remove now-unused StyleSheet entries**

  Delete from `StyleSheet.create({...})`:

  ```tsx
  // Delete:
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textColor,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  number: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.textColor,
  },
  ```

---

## Task 8 — TypeScript check + commit Category 3

- [ ] **Step 1: Run TypeScript check**

  ```bash
  cd /Users/mac/Desktop/pocketMonie && npx tsc --noEmit
  ```

  Expected: no new errors. Common failure: `Text` still referenced in `style` prop after migration — ensure all `style={styles.greeting}`, `style={styles.subtitle}`, and `style={styles.number}` references are removed from `<Text>` elements.

- [ ] **Step 2: Commit**

  ```bash
  git add screens/LockScreen.tsx screens/PinSetupScreen.tsx
  git commit -m "chore(ui): replace RN Text with custom Text in LockScreen and PinSetupScreen"
  ```

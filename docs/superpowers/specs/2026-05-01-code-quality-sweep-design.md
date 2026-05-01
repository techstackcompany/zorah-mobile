# Code Quality Sweep — Design Spec

**Date:** 2026-05-01  
**Author:** Akeem Mudashiru  
**Status:** Approved

---

## Overview

A mechanical, no-logic-change sweep of the Zorah codebase to remove debug noise, upgrade error logging in catch blocks, and fix two component violations. Delivered as a single PR with three commits.

---

## Goals

- Remove all debug data-inspection `console.log` calls left from development
- Upgrade `console.log`/`console.warn` in catch blocks to `console.error` for consistent error visibility
- Replace React Native's `Text` with the custom `<Text>` component in `LockScreen.tsx` and `PinSetupScreen.tsx`

## Non-Goals

- Adding Toast error handling for catch blocks (deferred to a follow-up)
- Removing legitimate `console.error` calls that are already correct
- Touching any business logic, state, or API calls

---

## Change Rules

### Category 1 — Remove debug data-inspection logs

**Rule:** Delete the entire line. These are `console.log("label", someVar)` calls used to inspect state during development. They have no runtime value.

**Affected files:**

| File | Lines |
|---|---|
| `screens/AccountScreen.tsx` | 145, 190 |
| `screens/SavingsGoalDetailsScreen.tsx` | 25–32 |
| `screens/SavingsGoalAddMoneyScreen.tsx` | 85–90, 129–132 |
| `screens/HomeScreen.tsx` | 198, 258 |
| `screens/TrackSpendingScreen.tsx` | 176–177, 242, 294 |
| `screens/SubmitKycScreen.tsx` | 143–144 |
| `screens/FinancialGoalsScreen.tsx` | 156 |
| `hooks/useSetupProgress.ts` | 92, 101 |
| `hooks/useVoiceTranscriber.ts` | 79 |
| `contexts/push-notifications/PushNotificationsProvider.tsx` | All `console.log` calls in the FCM token registration flow, token refresh handler, foreground/background notification receivers, and permission grant/deny paths. `console.error` calls in catch blocks are kept. |
| `features/budget/hooks.ts` | 41, 57 |

### Category 2 — Upgrade catch block logs to `console.error`

**Rule:** Replace `console.log(...)` or `console.warn(...)` with `console.error(...)`. Keep the message and arguments identical. No other change.

**Affected files:**

| File | Lines | Current |
|---|---|---|
| `screens/BudgetArchiveScreen.tsx` | 179 | `console.log("error", error.message)` |
| `screens/YourBanksScreen.tsx` | 147 | `console.log("_error.message", _error.message)` |
| `screens/IncomeDetailsScreen.tsx` | 48 | `console.log("error", error.message)` |
| `screens/AddExpenseScreen.tsx` | 279 | `console.log("error", error)` |
| `screens/EditExpenseIncomeScreen.tsx` | 234 | `console.log("error", error)` |
| `screens/SignUpScreen.tsx` | 93 | `console.log("error", error)` |
| `screens/SignInScreen.tsx` | 66 | `console.warn(...)` |
| `contexts/settings-context/SettingsProvider.tsx` | 81 | `console.log(error)` |

### Category 3 — Fix `Text` component violations

**Rule:** In each file, remove `Text` from the `react-native` import destructure and add `import Text from "@/components/ui/Text"`. For each `<Text style={styles.someStyle}>` usage, move font-weight and font-size styles to equivalent `weight` and `className` props on the custom component. Where no semantic font family is needed, default to `family="nunito"` (the component default).

**Affected files:**

| File | Note |
|---|---|
| `screens/LockScreen.tsx` | Uses `Text` for greeting, subtitle, PIN numbers, keypad digits |
| `screens/PinSetupScreen.tsx` | Uses `Text` for greeting, subtitle, PIN numbers, keypad digits |

Both files use `StyleSheet` styles on `<Text>` that express `fontSize`, `fontWeight`, and `color`. These get migrated to `className` (Tailwind) and `weight` prop. `StyleSheet` entries that only serve text styling are removed; entries shared with non-text elements are kept.

---

## Commit Structure

```
chore(cleanup): remove debug console.log calls
chore(cleanup): upgrade catch-block logs to console.error  
chore(ui): replace RN Text with custom Text in LockScreen and PinSetupScreen
```

---

## What Is NOT Changed

The following `console.error` calls are already correct and must not be touched:

- `screens/TransactionDetailsScreen.tsx` — receipt capture, download, share errors
- `contexts/user-inactivity/UserInactivityProvider.tsx` — background state load failure
- `hooks/useSpeechRecognition.ts` — permission and recording errors
- `hooks/useVoiceTranscriber.ts` — permission and transcription errors (except line 79)
- `hooks/useSetupProgress.ts` — storage flag errors

---

## Risk Assessment

**Low.** All changes are mechanical — no control flow, state, or API behaviour is altered. The only change with any visual impact is the `Text` component migration in `LockScreen` and `PinSetupScreen`, which must preserve the existing rendered appearance.

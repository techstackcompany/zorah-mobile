# Biometrics Proper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 11 correctness/security/architecture bugs and apply 4 architectural improvements: offline PIN verification, 30 s background threshold, setTimeout-based inactivity tracking, and per-device biometric preference.

**Architecture:** Extract a shared biometric capability hook. Hash the PIN with SHA-256 via `expo-crypto` and store in SecureStore — unlock is fully offline. Remove all network calls from the unlock flow. Replace the polling `setInterval` with a single re-scheduled `setTimeout`. Widen the background lock threshold from 5 s → 30 s. Biometric enabled/disabled is a local per-device preference — no server sync.

**Tech Stack:** `expo-local-authentication`, `expo-crypto` (new), `expo-secure-store`, `@react-native-async-storage/async-storage`, TanStack Query, React Context, `react-native-reanimated`, `expo-haptics`

---

## Decision Log

Read this before implementing. These decisions shape every task.

### D1 — Local PIN verification (no network on unlock)
**Problem:** `POST /verify-pin` is called on every unlock. Offline = locked out of your own app.
**Decision:** On PIN setup, hash the PIN with SHA-256 and store the hash in SecureStore (`"zorah:pin_hash"`). On unlock, hash the entered PIN and compare locally. `POST /auth/set-pin` is still called when setting the PIN so the server's `hasPin` field stays accurate. `POST /auth/verify-pin` is never called again after this change.

### D2 — Background threshold: 5 s → 30 s
**Problem:** 5 seconds locks the user out while switching to a messaging app to copy an OTP code.
**Decision:** Raise `BACKGROUND_LOCK_TIMEOUT_MS` to 30 000 ms. Minimum acceptable for a finance app without killing daily usability.

### D3 — Replace `setInterval` with `setTimeout`
**Problem:** `setInterval` every 5 s polls permanently for a one-shot event. Wasteful on battery.
**Decision:** On every user touch (`markActive`), cancel any pending timeout and schedule a single `setTimeout(triggerLock, INACTIVITY_LOCK_TIMEOUT_MS)`. Cancel on background, reschedule on foreground return. Fires exactly once per idle period.

### D4 — Per-device biometric preference
**Problem:** `biometricEnabled` is a server-side account flag. After reinstall it either silently re-enables lock on a device the user didn't intend, or requires a server round trip to sync.
**Decision:** `settings.enableBiometrics` (AsyncStorage) is the sole source of truth for whether the lock is active on *this* device. The server is not consulted or updated when the user toggles biometrics — it is a local preference. `POST /auth/toggle-biometrics` is no longer called anywhere. The server is only involved when setting the PIN (`POST /auth/set-pin`) so it can track `hasPin: true`.

---

## Bug Inventory

| # | Severity | Bug | File | Line |
|---|---|---|---|---|
| 1 | 🔴 Security | Android back button dismisses lock Modal — no `onRequestClose` | `screens/LockScreen.tsx` | 348 |
| 2 | 🟠 Race | Biometric auto-trigger fires before `checking` resolves → native dialog on devices without biometrics | `screens/LockScreen.tsx` | 193 |
| 3 | 🟠 Re-trigger | `handleUnlockSuccess` in biometric `useEffect` deps re-fires mid-session if callback reference changes | `screens/LockScreen.tsx` | 205 |
| 4 | 🟠 Settings race | `UserInactivityProvider` reads `settings.enableBiometrics` before AsyncStorage loads — cold-start lock skipped | `UserInactivityProvider.tsx` | 117 |
| 5 | 🟡 Logic | Inactivity timer sets `wasInBackground.current = true` before `triggerLock` — not a background event, corrupts foreground detection | `UserInactivityProvider.tsx` | 151 |
| 6 | 🟡 Network | Every PIN unlock hits `POST /verify-pin` — offline = locked out | `screens/LockScreen.tsx` | 140 |
| 7 | 🟡 UX | Background threshold is 5 s — too aggressive for normal multitasking | `UserInactivityProvider.tsx` | 11 |
| 8 | 🟡 Battery | `setInterval` polls every 5 s permanently; single `setTimeout` is correct | `UserInactivityProvider.tsx` | 137 |
| 9 | 🟡 UX | `handleBiometricToggle` always navigates to PinSetupScreen even if user already has a PIN | `screens/AccountScreen.tsx` | 177 |
| 10 | 🔵 DRY | `useDeviceBiometricSupport` logic exists in 3 places | `LockScreen.tsx`, `PinSetupScreen.tsx`, `biometric-lock-package/` | — |
| 11 | 🔵 Cleanup | 4 settings fields defined but never read: `faceIdEnabled`, `fingerprintEnabled`, `appLockEnabled`, `appLockRequireFaceId` | `SettingsProvider.tsx` | 17 |

---

## Behavioral Change Summary

### Unlock with PIN

| Scenario | Before | After |
|---|---|---|
| User enters correct PIN | `POST /verify-pin` → server returns 200 → unlock | Hash entered PIN → compare to SecureStore hash → unlock |
| Device offline | ❌ Network error — user locked out | ✅ Unlocks normally |
| Wrong PIN | Server 401 → shake + toast | Hash mismatch → shake + toast |

### Enable biometrics (AccountScreen)

| Scenario | Before | After |
|---|---|---|
| User has PIN (`hasPin: true`) AND local hash stored | Always → PinSetupScreen | `updateSetting("enableBiometrics", true)` + toast, done |
| User has no PIN or local hash missing | → PinSetupScreen | → PinSetupScreen (unchanged) |

### Disable biometrics (AccountScreen)

| Scenario | Before | After |
|---|---|---|
| Confirm disable | `POST /toggle-biometrics { enabled: false }` + `updateSetting` | `updateSetting("enableBiometrics", false)` only — no API call |

### Lock timer

| Aspect | Before | After |
|---|---|---|
| Background threshold | 5 s | 30 s |
| Inactivity mechanism | `setInterval` every 5 s | Single `setTimeout`, reset on each touch |
| Timer while locked | Still running | Cancelled |
| Timer after unlock | Continues from last interval fire | Freshly scheduled from unlock time |

---

## File Map

| File | Action | Fixes |
|---|---|---|
| `constants/auth.ts` | Modify | Add `PIN_HASH_KEY` |
| `hooks/useBiometricSupport.ts` | **Create** | Bug 10 |
| `lib/pinStorage.ts` | **Create** | Bug 6 (D1) |
| `screens/LockScreen.tsx` | Modify | Bugs 1, 2, 3, 6, 10 |
| `contexts/user-inactivity/UserInactivityProvider.tsx` | Modify | Bugs 4, 5, 7, 8 |
| `screens/PinSetupScreen.tsx` | Modify | Store hash locally; use shared hook; remove toggle-biometrics call |
| `screens/AccountScreen.tsx` | Modify | Bug 9; per-device enable/disable (D4) |
| `contexts/auth-context/SessionProvider.tsx` | Modify | Clear PIN hash on sign-out |
| `contexts/settings-context/SettingsProvider.tsx` | Modify | Bug 11 |

---

## Constants & Keys Reference

| Constant | File | Value | Purpose |
|---|---|---|---|
| `PIN_HASH_KEY` | `constants/auth.ts` | `"zorah:pin_hash"` | SecureStore key for hashed PIN |
| `TOKEN_KEY` | `constants/auth.ts` | (existing — do not change) | JWT access token |
| `REFRESH_TOKEN_KEY` | `constants/auth.ts` | (existing — do not change) | Refresh token |
| `LAST_BACKGROUND_KEY` | `UserInactivityProvider.tsx` | `"userInactivity:wasInBackground"` | (unchanged) |
| `LAST_ACTIVE_KEY` | `UserInactivityProvider.tsx` | `"userInactivity:lastActive"` | (unchanged) |

---

## Prerequisites

- [ ] **Install `expo-crypto`**

```bash
cd /Users/mac/Desktop/pocketMonie
npx expo install expo-crypto
```

Expected: `package.json` and `package-lock.json` updated. No rebuild required at this stage.

- [ ] **Confirm `secureStoreGetItem`/`secureStoreSetItem`/`secureStoreRemoveItem` export names**

```bash
grep -n "^export" /Users/mac/Desktop/pocketMonie/lib/persistedStorageConfig.ts
```

Expected: confirms the three functions above are exported. If their names differ, adjust `lib/pinStorage.ts` (Task 2) accordingly.

- [ ] **Confirm `COLORS.primary_100` exists**

```bash
grep "primary_100" /Users/mac/Desktop/pocketMonie/constants/colors.ts
```

If absent, use `COLORS.primary_200` in the `biometricBtn` style in Task 4's LockScreen replacement.

---

## Task 1 — Add `PIN_HASH_KEY` constant

**Files:**
- Modify: `constants/auth.ts`

- [ ] **Step 1: Read the file**

```bash
cat /Users/mac/Desktop/pocketMonie/constants/auth.ts
```

Note the existing exports so you do not overwrite them.

- [ ] **Step 2: Append the new constant**

Add to the end of `constants/auth.ts`:

```typescript
export const PIN_HASH_KEY = "zorah:pin_hash";
```

- [ ] **Step 3: Verify**

```bash
grep "PIN_HASH_KEY" /Users/mac/Desktop/pocketMonie/constants/auth.ts
```

Expected: line with the constant found.

- [ ] **Step 4: Commit**

```bash
git add constants/auth.ts
git commit -m "feat(biometrics): add PIN_HASH_KEY constant for local PIN storage"
```

---

## Task 2 — Create `lib/pinStorage.ts`

**Files:**
- Create: `lib/pinStorage.ts`

This is the single module that hashes and stores the PIN. Called by `PinSetupScreen` (save) and `LockScreen` (verify). Uses the existing SecureStore helpers from `lib/persistedStorageConfig.ts`.

- [ ] **Step 1: Create the file**

```typescript
import { PIN_HASH_KEY } from "@/constants/auth";
import * as Crypto from "expo-crypto";
import {
  secureStoreGetItem,
  secureStoreRemoveItem,
  secureStoreSetItem,
} from "@/lib/persistedStorageConfig";

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
}

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await secureStoreSetItem(PIN_HASH_KEY, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = await secureStoreGetItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  const enteredHash = await hashPin(pin);
  return enteredHash === storedHash;
}

export async function clearPin(): Promise<void> {
  await secureStoreRemoveItem(PIN_HASH_KEY);
}

export async function hasPinStored(): Promise<boolean> {
  const stored = await secureStoreGetItem(PIN_HASH_KEY);
  return stored !== null;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/mac/Desktop/pocketMonie && npx tsc --noEmit 2>&1 | grep "pinStorage"
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add lib/pinStorage.ts
git commit -m "feat(biometrics): local PIN hash storage using expo-crypto + SecureStore"
```

---

## Task 3 — Create `hooks/useBiometricSupport.ts`

**Files:**
- Create: `hooks/useBiometricSupport.ts`

- [ ] **Step 1: Create the file**

```typescript
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";

export type BiometricSupport = {
  hasHardware: boolean;
  supportsFaceId: boolean;
  supportsFingerprint: boolean;
  isEnrolled: boolean;
  checking: boolean;
  isAvailable: boolean;
};

export function useBiometricSupport(): BiometricSupport {
  const [support, setSupport] = useState<Omit<BiometricSupport, "isAvailable">>({
    hasHardware: false,
    supportsFaceId: false,
    supportsFingerprint: false,
    isEnrolled: false,
    checking: true,
  });

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const [hasHardware, supportedTypes, isEnrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        if (!active) return;
        setSupport({
          hasHardware,
          supportsFaceId: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          ),
          supportsFingerprint: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT,
          ),
          isEnrolled,
          checking: false,
        });
      } catch {
        if (active) setSupport((prev) => ({ ...prev, checking: false }));
      }
    };
    check();
    return () => {
      active = false;
    };
  }, []);

  return {
    ...support,
    isAvailable: !support.checking && support.hasHardware && support.isEnrolled,
  };
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "useBiometricSupport"
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useBiometricSupport.ts
git commit -m "feat(biometrics): extract shared useBiometricSupport hook"
```

---

## Task 4 — Rewrite `screens/LockScreen.tsx` (Bugs 1, 2, 3, 6, 10)

**Files:**
- Modify: `screens/LockScreen.tsx`

Replace the **entire file** with the content below. Do not merge — overwrite completely.

**What changed vs the original:**
- Removed: inline `useDeviceBiometricSupport` hook definition (lines 47–100) → replaced by import from `@/hooks/useBiometricSupport`
- Removed: `useVerifyUserPinMutation` → replaced by `verifyPin` from `@/lib/pinStorage`
- Removed: `useRouter` import (dead code — `onUnlock` callback is always provided in modal variant; screen variant still works via `onUnlock?.()`)
- Removed: `AsyncStorage` import (no longer needed)
- Added: `biometricAttempted` ref — prevents biometric re-trigger mid-session
- Added: `pinError` state — dots turn red on wrong PIN before clearing
- Fixed: auto-trigger `useEffect` now guards `!checking && isAvailable` (Bug 2)
- Fixed: auto-trigger `useEffect` deps no longer include `handleUnlockSuccess` directly — uses `biometricAttempted` ref instead (Bug 3)
- Fixed: `onRequestClose={() => {}}` on Modal (Bug 1 — Android back button)
- Fixed: PIN verification is now local via `verifyPin()` — fully offline (Bug 6)

- [ ] **Step 1: Replace the entire file**

```typescript
import COLORS from "@/constants/colors";
import { useBiometricSupport } from "@/hooks/useBiometricSupport";
import { verifyPin } from "@/lib/pinStorage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Text from "@/components/ui/Text";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CODE_FIELDS = 4;
const OFFSET = 20;
const TIME = 80;

type LockScreenProps = {
  visible?: boolean;
  onUnlock?: () => void;
  variant?: "screen" | "modal";
};

const LockScreen = ({
  visible = true,
  onUnlock,
  variant = "screen",
}: LockScreenProps) => {
  const [code, setCode] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState(false);
  const biometricAttempted = useRef(false);

  const {
    isAvailable: biometricsAvailable,
    supportsFaceId,
    supportsFingerprint,
    checking,
  } = useBiometricSupport();

  const biometricIcon =
    Platform.OS === "android" || supportsFingerprint
      ? "fingerprint"
      : supportsFaceId
        ? "face-recognition"
        : "lock";

  const codeLength = Array(CODE_FIELDS).fill(null);
  const offset = useSharedValue(0);

  const shakeAndReset = useCallback(() => {
    offset.value = withSequence(
      withTiming(-OFFSET, { duration: TIME / 20 }),
      withRepeat(withTiming(OFFSET, { duration: TIME / 2 }), 4, true),
      withTiming(0, { duration: TIME / 2 }),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [offset]);

  // Reset state when lock hides so the next session starts clean.
  useEffect(() => {
    if (!visible) {
      biometricAttempted.current = false;
      setCode([]);
      setIsVerifying(false);
      setPinError(false);
    }
  }, [visible]);

  const handleUnlockSuccess = useCallback(() => {
    setCode([]);
    setIsVerifying(false);
    setPinError(false);
    onUnlock?.();
  }, [onUnlock]);

  // Auto-trigger biometric once per lock session. Guards against calling
  // authenticateAsync before availability is confirmed (checking === false)
  // and against re-triggering when handleUnlockSuccess reference changes.
  useEffect(() => {
    if (!visible || checking || !biometricsAvailable || biometricAttempted.current) {
      return;
    }
    biometricAttempted.current = true;

    const attempt = async () => {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Zorah",
        disableDeviceFallback: false,
      });
      if (success) {
        handleUnlockSuccess();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };
    attempt();
  }, [visible, checking, biometricsAvailable, handleUnlockSuccess]);

  // Verify PIN locally once 4 digits are entered. No network call.
  useEffect(() => {
    if (code.length !== CODE_FIELDS || isVerifying) return;

    setIsVerifying(true);
    verifyPin(code.join("")).then((isCorrect) => {
      if (isCorrect) {
        handleUnlockSuccess();
      } else {
        setIsVerifying(false);
        setCode([]);
        setPinError(true);
        shakeAndReset();
        Toast.show({
          type: "error",
          text1: "Incorrect PIN",
          text2: "Please try again.",
        });
      }
    });
  }, [code, isVerifying, handleUnlockSuccess, shakeAndReset]);

  const onNumberPress = (number: number) => {
    if (code.length < CODE_FIELDS && !isVerifying) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPinError(false);
      setCode((prev) => [...prev, number]);
    }
  };

  const onBackSpacePress = () => {
    if (code.length > 0 && !isVerifying) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCode(code.slice(0, -1));
    }
  };

  const onBiometricPress = async () => {
    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Zorah",
      disableDeviceFallback: false,
    });
    if (success) {
      handleUnlockSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  if (!visible) return null;

  const content = (
    <LinearGradient colors={["#F6FAFF", "#FFFFFF"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.appIcon}
              contentFit="contain"
            />
          </View>
          <Text
            family="degular"
            weight="bold"
            className="text-[28px] text-textColor tracking-[0.5px] mb-2"
          >
            Welcome back
          </Text>
          <Text weight="regular" className="text-[15px] text-[#6B7280]">
            Enter your PIN to continue
          </Text>
        </View>

        <Animated.View style={[styles.codeView, style]}>
          {codeLength.map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeEmpty,
                {
                  backgroundColor:
                    index < code.length
                      ? pinError
                        ? COLORS.error
                        : COLORS.primary_400
                      : "transparent",
                  borderColor:
                    index < code.length
                      ? pinError
                        ? COLORS.error
                        : COLORS.primary_400
                      : COLORS.primary_200,
                  borderWidth: index < code.length ? 0 : 2,
                  opacity: isVerifying ? 0 : 1,
                },
              ]}
            />
          ))}
          {isVerifying && (
            <View style={styles.verifyingOverlay}>
              <ActivityIndicator size="small" color={COLORS.primary_400} />
            </View>
          )}
        </Animated.View>

        <View style={styles.numbersView}>
          {[0, 1, 2].map((rowIndex) => {
            const base = rowIndex * 3 + 1;
            return (
              <View
                key={rowIndex}
                style={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                {[base, base + 1, base + 2].map((number) => (
                  <TouchableOpacity
                    key={number}
                    style={[styles.keypadBtn, styles.numberBtn]}
                    onPress={() => onNumberPress(number)}
                  >
                    <Text weight="semibold" className="text-[28px] text-textColor">
                      {number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              disabled={!biometricsAvailable}
              onPress={biometricsAvailable ? onBiometricPress : undefined}
              style={[
                styles.keypadBtn,
                styles.biometricBtn,
                !biometricsAvailable && styles.disabledKeypad,
              ]}
            >
              <MaterialCommunityIcons
                name={biometricIcon}
                size={28}
                color={biometricsAvailable ? COLORS.primary_400 : COLORS.grey}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNumberPress(0)}
              style={[styles.keypadBtn, styles.numberBtn]}
            >
              <Text weight="semibold" className="text-[28px] text-textColor">
                0
              </Text>
            </TouchableOpacity>
            <View style={styles.keypadBtn}>
              {code.length > 0 && (
                <TouchableOpacity
                  style={[styles.keypadBtn, styles.backspaceBtn]}
                  onPress={onBackSpacePress}
                >
                  <MaterialCommunityIcons
                    name="backspace"
                    size={22}
                    color={COLORS.textColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  if (variant === "modal") {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: COLORS.primary_400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appIcon: { width: 60, height: 60 },
  codeView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 60,
    paddingHorizontal: 20,
    position: "relative",
  },
  verifyingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  codeEmpty: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  numbersView: { marginHorizontal: 40, gap: 24, marginTop: 20 },
  keypadBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  numberBtn: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biometricBtn: {
    backgroundColor: COLORS.primary_200,
    borderWidth: 1,
    borderColor: COLORS.primary_200,
  },
  backspaceBtn: { backgroundColor: "transparent" },
  disabledKeypad: { opacity: 0.4 },
});

export default LockScreen;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "LockScreen"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add screens/LockScreen.tsx
git commit -m "fix(biometrics): local PIN verify, Android back security fix, biometric race condition"
```

---

## Task 5 — Rewrite `contexts/user-inactivity/UserInactivityProvider.tsx` (Bugs 4, 5, 7, 8)

**Files:**
- Modify: `contexts/user-inactivity/UserInactivityProvider.tsx`

Replace the **entire file**. Key changes vs original:
- `BACKGROUND_LOCK_TIMEOUT_MS`: 5 000 → 30 000
- `setInterval` removed → `inactivityTimerRef` + `setTimeout`
- `scheduleInactivityTimer()` / `cancelInactivityTimer()` helpers
- `markActive()` now calls `scheduleInactivityTimer()` instead of only updating timestamps
- AppState subscription extracted to its own `useEffect` (no longer combined with initial check)
- Initial cold-start check extracted to its own `useEffect`, gated on `settingsLoaded`
- `wasInBackground.current = true` removed from inactivity timer path (Bug 5)
- Cleanup `useEffect` cancels timer on unmount

- [ ] **Step 1: Replace the entire file**

```typescript
import Overlay from "@/components/ui/Overlay";
import useAppSettings from "@/contexts/settings-context/useAppSettings";
import LockScreen from "@/screens/LockScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, View } from "react-native";

const LAST_BACKGROUND_KEY = "userInactivity:wasInBackground";
const LAST_ACTIVE_KEY = "userInactivity:lastActive";
const INACTIVITY_LOCK_TIMEOUT_MS = 60_000 * 5; // 5 minutes of no interaction
const BACKGROUND_LOCK_TIMEOUT_MS = 30_000; // 30 seconds in background before locking

const UserInactivityProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const wasInBackground = useRef<boolean>(false);
  const lastActiveAt = useRef<number | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLockVisible, setIsLockVisible] = useState(false);
  const [showPrivacyOverlay, setShowPrivacyOverlay] = useState(false);
  const { settings, isLoaded: settingsLoaded } = useAppSettings();

  const persistState = useCallback((entries: [string, string][]) => {
    void AsyncStorage.multiSet(entries);
  }, []);

  const cancelInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const triggerLock = useCallback(() => {
    if (!settings.enableBiometrics) return;
    cancelInactivityTimer();
    setIsLockVisible(true);
  }, [settings.enableBiometrics, cancelInactivityTimer]);

  // Cancels any previous timeout and schedules a new one. Called on every
  // user touch, after unlock, and on foreground return when not locking.
  const scheduleInactivityTimer = useCallback(() => {
    cancelInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      triggerLock();
    }, INACTIVITY_LOCK_TIMEOUT_MS);
  }, [cancelInactivityTimer, triggerLock]);

  const hideLock = useCallback(() => {
    setIsLockVisible(false);
    const now = Date.now();
    persistState([
      [LAST_BACKGROUND_KEY, "false"],
      [LAST_ACTIVE_KEY, now.toString()],
    ]);
    lastActiveAt.current = now;
    setShowPrivacyOverlay(false);
    scheduleInactivityTimer();
  }, [persistState, scheduleInactivityTimer]);

  // Called on every user touch via the View responder wrapper below.
  const markActive = useCallback(() => {
    if (isLockVisible || appState.current !== "active") return;
    const now = Date.now();
    lastActiveAt.current = now;
    AsyncStorage.setItem(LAST_ACTIVE_KEY, now.toString());
    scheduleInactivityTimer();
  }, [isLockVisible, scheduleInactivityTimer]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const previousState = appState.current;

      if (
        (nextAppState === "background" || nextAppState === "inactive") &&
        previousState === "active"
      ) {
        wasInBackground.current = true;
        cancelInactivityTimer();
        const now = Date.now();
        lastActiveAt.current = now;
        persistState([
          [LAST_BACKGROUND_KEY, "true"],
          [LAST_ACTIVE_KEY, now.toString()],
        ]);
        if (settings.enableBiometrics && settings.privacyOverlayEnabled) {
          setShowPrivacyOverlay(true);
        }
      }

      if (
        nextAppState === "active" &&
        (previousState === "background" || previousState === "inactive")
      ) {
        setShowPrivacyOverlay(false);
        if (settings.enableBiometrics && wasInBackground.current) {
          wasInBackground.current = false;
          const lastActiveTime = lastActiveAt.current ?? Date.now();
          const shouldLock =
            Date.now() - lastActiveTime >= BACKGROUND_LOCK_TIMEOUT_MS;
          if (shouldLock) {
            triggerLock();
          } else {
            hideLock();
          }
        } else {
          wasInBackground.current = false;
          scheduleInactivityTimer();
        }
      }

      appState.current = nextAppState;
    },
    [
      hideLock,
      settings.enableBiometrics,
      settings.privacyOverlayEnabled,
      triggerLock,
      persistState,
      cancelInactivityTimer,
      scheduleInactivityTimer,
    ],
  );

  // Register AppState listener. Separate from the cold-start check so that
  // the listener is not re-registered when settingsLoaded changes.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  // Cold-start lock check. Waits for settings to load from AsyncStorage before
  // making any decision so the default false value never silently skips a lock.
  useEffect(() => {
    if (!settingsLoaded) return;

    const checkInitialLockState = async () => {
      try {
        const [storedBackground, storedLastActive] = await AsyncStorage.multiGet([
          LAST_BACKGROUND_KEY,
          LAST_ACTIVE_KEY,
        ]);
        const wasBg = storedBackground?.[1] === "true";
        const lastActive = Number(storedLastActive?.[1] ?? "");
        lastActiveAt.current = Number.isFinite(lastActive) ? lastActive : Date.now();

        if (
          settings.enableBiometrics &&
          wasBg &&
          Date.now() - (lastActiveAt.current ?? Date.now()) >= BACKGROUND_LOCK_TIMEOUT_MS
        ) {
          triggerLock();
        } else {
          scheduleInactivityTimer();
        }
      } catch (error) {
        console.error("Failed to load background state", error);
        scheduleInactivityTimer();
      }
    };
    checkInitialLockState();
  }, [settingsLoaded, settings.enableBiometrics, triggerLock, scheduleInactivityTimer]);

  // Auto-dismiss lock if biometrics is disabled while lock is visible.
  useEffect(() => {
    if (!settings.enableBiometrics && isLockVisible) {
      setIsLockVisible(false);
      setShowPrivacyOverlay(false);
    }
  }, [isLockVisible, settings.enableBiometrics]);

  // Cancel timer on unmount to prevent memory leaks.
  useEffect(() => {
    return () => cancelInactivityTimer();
  }, [cancelInactivityTimer]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        markActive();
        return false;
      }}
      onTouchEndCapture={markActive}
    >
      {children}

      {showPrivacyOverlay ? (
        <View style={StyleSheet.absoluteFill}>
          <Overlay />
        </View>
      ) : null}

      <LockScreen visible={isLockVisible} onUnlock={hideLock} variant="modal" />
    </View>
  );
};

export default UserInactivityProvider;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "UserInactivityProvider"
```

- [ ] **Step 3: Commit**

```bash
git add contexts/user-inactivity/UserInactivityProvider.tsx
git commit -m "fix(biometrics): 30s background threshold, setTimeout inactivity, fix cold-start lock race"
```

---

## Task 6 — Update `screens/PinSetupScreen.tsx`

**Files:**
- Modify: `screens/PinSetupScreen.tsx`

**Changes (surgical — do not rewrite the whole file):**
1. Add imports: `useBiometricSupport`, `savePin`
2. Remove: `LocalAuthentication` import, `useState` for `biometricsAvailable`, inline `useEffect` biometrics check
3. Remove: `useToggleBiometricsMutation` import and entire declaration
4. Update: `setPinMutation.onSuccess` to call `savePin` + `updateSetting` locally
5. Update: `isLoading` derived value (remove `toggleBiometricsMutation.isPending`)

- [ ] **Step 1: Add new imports at the top of `PinSetupScreen.tsx`**

```typescript
import { useBiometricSupport } from "@/hooks/useBiometricSupport";
import { savePin } from "@/lib/pinStorage";
```

- [ ] **Step 2: Remove these imports**

Remove the line:
```typescript
import * as LocalAuthentication from "expo-local-authentication";
```

From the `@/src/api/hooks` import line, remove `useToggleBiometricsMutation`. If `useSetUserPinMutation` is the only remaining import, it should read:
```typescript
import { useSetUserPinMutation } from "@/src/api/hooks";
```

- [ ] **Step 3: Replace biometrics state + inline check**

Remove:
```typescript
const [biometricsAvailable, setBiometricsAvailable] = useState(false);

useEffect(() => {
  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricsAvailable(hasHardware && isEnrolled);
    } catch {
      setBiometricsAvailable(false);
    }
  };
  checkBiometrics();
}, []);
```

Add (after the other hook calls, before `toggleBiometricsMutation`):
```typescript
const { isAvailable: biometricsAvailable } = useBiometricSupport();
```

- [ ] **Step 4: Remove the entire `toggleBiometricsMutation` block**

Delete from:
```typescript
const toggleBiometricsMutation = useToggleBiometricsMutation({
```
…to its closing `});` — including `onSuccess` and `onError` handlers.

- [ ] **Step 5: Replace `setPinMutation` with updated version**

```typescript
const setPinMutation = useSetUserPinMutation({
  onSuccess: async () => {
    await savePin(pin);
    updateSetting("enableBiometrics", biometricsAvailable);

    Toast.show({
      type: "success",
      text1: "PIN Set Successfully",
      text2: biometricsAvailable
        ? "Your PIN is set and biometric login is enabled."
        : "Your account is now secured with a PIN.",
    });

    await queryClient.refetchQueries({ queryKey: ["auth", "profile"] });
    const freshProfile = queryClient.getQueryData(["auth", "profile"]);
    if (freshProfile) {
      setUserData(freshProfile);
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(app)/(home)");
    }
  },
  onError: (error) => {
    Toast.show({
      type: "error",
      text1: "Failed to Set PIN",
      text2: error.message || "Please try again.",
    });
    setPin("");
    setConfirmPin("");
    setStep("create");
  },
});
```

- [ ] **Step 6: Update `isLoading`**

Replace:
```typescript
const isLoading = useMemo(
  () => setPinMutation.isPending || toggleBiometricsMutation.isPending,
  [setPinMutation.isPending, toggleBiometricsMutation.isPending],
);
```

With:
```typescript
const isLoading = setPinMutation.isPending;
```

Remove the `useMemo` import from React if it is no longer used elsewhere in the file (check the full import list first).

- [ ] **Step 7: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "PinSetupScreen"
```

- [ ] **Step 8: Commit**

```bash
git add screens/PinSetupScreen.tsx
git commit -m "refactor(biometrics): store PIN hash locally, remove toggle-biometrics call, use shared hook"
```

---

## Task 7 — Update `screens/AccountScreen.tsx` (Bug 9 + D4)

**Files:**
- Modify: `screens/AccountScreen.tsx`

**Changes:**
1. Remove `useToggleBiometricsMutation` import and declaration
2. Replace `handleBiometricToggle` — checks `hasPin` AND `hasPinStored()` before skipping PinSetupScreen
3. Replace `confirmDisableBiometric` — local setting only, no API call
4. Simplify `useFocusEffect` — PinSetupScreen now handles `updateSetting` directly

- [ ] **Step 1: Remove `useToggleBiometricsMutation` import**

From the `@/src/api/hooks` import line, remove `useToggleBiometricsMutation`. If it was the only import, remove the line entirely.

- [ ] **Step 2: Add `hasPinStored` import**

```typescript
import { hasPinStored } from "@/lib/pinStorage";
```

- [ ] **Step 3: Remove the entire `toggleBiometricsMutation` declaration**

Delete the `useToggleBiometricsMutation({ onSuccess: ..., onError: ... })` block — it is no longer needed.

- [ ] **Step 4: Replace `handleBiometricToggle`**

```typescript
const handleBiometricToggle = async (nextValue: boolean) => {
  if (nextValue) {
    const safeUser = (userData ?? {}) as Record<string, unknown>;
    const serverHasPin =
      typeof safeUser.hasPin === "boolean" ? safeUser.hasPin : false;
    const localHasPin = await hasPinStored();

    if (serverHasPin && localHasPin) {
      // PIN set on server AND hash stored locally — re-enable biometrics without
      // going through PinSetupScreen.
      updateSetting("enableBiometrics", true);
      Toast.show({
        type: "success",
        text1: "Biometric login enabled",
        text2: "Your account can now be unlocked with biometrics.",
      });
    } else {
      // No PIN yet (or local hash cleared by sign-out) — must set up PIN first.
      setPendingEnableFromAccount(true);
      router.push("/(app)/(home)/profile/pin-setup");
    }
    return;
  }

  setShowDisableConfirmModal(true);
};
```

**Important:** because `handleBiometricToggle` is now `async`, update the Switch's `onValueChange` prop wherever it is called in the JSX to prevent an unhandled promise warning:

```tsx
onValueChange={(val) => void handleBiometricToggle(val)}
```

- [ ] **Step 5: Replace `confirmDisableBiometric`**

```typescript
const confirmDisableBiometric = () => {
  updateSetting("enableBiometrics", false);
  setShowDisableConfirmModal(false);
  Toast.show({
    type: "success",
    text1: "Biometric login disabled",
    text2: "PIN login remains available as backup.",
  });
};
```

- [ ] **Step 6: Simplify `useFocusEffect`**

PinSetupScreen now calls `updateSetting("enableBiometrics", ...)` directly on success, so the focus effect no longer needs to read `biometricEnabled` from the profile or show a toast. It only needs to refresh the profile (to update `hasPin`) and clear `pendingEnableFromAccount`.

```typescript
useFocusEffect(
  useCallback(() => {
    if (!pendingEnableFromAccount) return;

    let active = true;
    const refreshProfile = async () => {
      await queryClient.refetchQueries({
        queryKey: ["auth", "profile"],
        exact: true,
      });
      if (!active) return;
      const profile = queryClient.getQueryData<Record<string, unknown>>(["auth", "profile"]);
      if (profile) {
        setUserData(profile);
      }
      setPendingEnableFromAccount(false);
    };
    refreshProfile();
    return () => {
      active = false;
    };
  }, [pendingEnableFromAccount, queryClient, setUserData]),
);
```

- [ ] **Step 7: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "AccountScreen"
```

- [ ] **Step 8: Commit**

```bash
git add screens/AccountScreen.tsx
git commit -m "fix(biometrics): per-device enable/disable, hasPin guard, no toggle-biometrics API call"
```

---

## Task 8 — Clear PIN on sign-out in `SessionProvider`

**Files:**
- Modify: `contexts/auth-context/SessionProvider.tsx`

When a user signs out, the local PIN hash must be cleared. Otherwise, if a different person signs in on the same device, the previous user's PIN hash would still be present and the `hasPinStored()` check in AccountScreen would incorrectly skip PinSetupScreen.

The `signOut` function is at line 109 of `SessionProvider.tsx`. It is already `async`.

- [ ] **Step 1: Add `clearPin` import**

Add to the imports at the top of `SessionProvider.tsx`:

```typescript
import { clearPin } from "@/lib/pinStorage";
```

- [ ] **Step 2: Add `await clearPin()` inside `signOut`**

Inside the `signOut` function, add the call **before** `router.replace`. The exact insertion point is after `queryClient.clear()` and before `setSession(null)`:

```typescript
const signOut = useCallback(async () => {
  // ... existing email preservation logic (do not touch) ...

  await clearPersistedQueryCache();

  queryClient.removeQueries();
  queryClient.clear();

  await clearPin(); // clear local PIN hash so a new user starts fresh

  setSession(null);
  setIsVerified(null);
  setKycVerificationStatusRaw(null);
  setUserDataRaw(null);
  setHasCompletedSetupRaw(null);
  setSetupStepRaw(null);
  router.replace("/(auth)/signIn");
}, [
  queryClient,
  setSession,
  setIsVerified,
  setKycVerificationStatusRaw,
  setUserDataRaw,
  setHasCompletedSetupRaw,
  setSetupStepRaw,
  userData,
]);
```

Do not change the `useCallback` dependency array — `clearPin` is a module-level function, not a React value.

- [ ] **Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "SessionProvider"
```

- [ ] **Step 4: Commit**

```bash
git add contexts/auth-context/SessionProvider.tsx
git commit -m "fix(biometrics): clear PIN hash on sign-out so new sessions start fresh"
```

---

## Task 9 — Clean up `SettingsProvider` (Bug 11)

**Files:**
- Modify: `contexts/settings-context/SettingsProvider.tsx`

- [ ] **Step 1: Confirm the 4 fields are unused**

```bash
grep -rn "faceIdEnabled\|fingerprintEnabled\|appLockEnabled\|appLockRequireFaceId" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=".expo" \
  /Users/mac/Desktop/pocketMonie
```

Expected: output contains **only** lines inside `SettingsProvider.tsx`. If any other file references them, **do not remove** — stop and reassess.

- [ ] **Step 2: Update `SettingsState` type**

```typescript
type SettingsState = {
  hasSeenTourVideo: boolean;
  hasCompletedTour: boolean;
  enableBiometrics: boolean;
  privacyOverlayEnabled: boolean;
  marketingEmails: boolean;
  personalizedInsights: boolean;
  shareAnonymizedData: boolean;
  pushNotification: boolean;
  language: LanguageOption;
};
```

- [ ] **Step 3: Update `defaultSettings`**

```typescript
const defaultSettings: SettingsState = {
  hasSeenTourVideo: false,
  hasCompletedTour: false,
  enableBiometrics: false,
  privacyOverlayEnabled: true,
  marketingEmails: true,
  personalizedInsights: true,
  shareAnonymizedData: false,
  pushNotification: true,
  language: defaultLanguage,
};
```

- [ ] **Step 4: Wrap `resetSettings` in `useCallback` and fix the `useMemo` deps**

```typescript
const resetSettings = useCallback(() => {
  setSettings(defaultSettings);
  AsyncStorage.setItem("settings", JSON.stringify(defaultSettings));
}, []);

const value = useMemo<SettingsContextValue>(
  () => ({ settings, isLoaded, updateSetting, resetSettings }),
  [settings, isLoaded, updateSetting, resetSettings],
);
```

- [ ] **Step 5: Full TypeScript check across the entire project**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: 0 errors introduced by this work. If pre-existing errors exist that are unrelated to biometrics, note them but do not fix them here.

- [ ] **Step 6: Commit**

```bash
git add contexts/settings-context/SettingsProvider.tsx
git commit -m "refactor(settings): remove 4 unused biometric fields, fix resetSettings memoization"
```

---

## Verification Scenarios

Run all on a physical device or simulator after all 9 tasks complete.

### S1 — Offline PIN unlock (validates D1)
1. Enable biometrics (set PIN), confirm app locks after 30 s background
2. Enable airplane mode
3. Background app 35 s, return
4. Lock screen appears → enter correct PIN
5. **Expected:** Unlocks with no toast, no delay, no network request

### S2 — Android back button cannot dismiss lock (validates Bug 1)
1. Lock screen is visible
2. Press hardware back button
3. **Expected:** Nothing — app stays locked

### S3 — Biometric prompt timing (validates Bug 2)
1. Enable biometrics, background 35 s, return
2. **Expected:** Lock screen appears, biometric prompt fires after a brief moment (not instantly on first render). No failure dialog before the prompt.

### S4 — 30 s threshold (validates D2)
1. Enable biometrics
2. Background 10 s, return → **Expected:** no lock screen
3. Background 35 s, return → **Expected:** lock screen appears

### S5 — Re-enable biometrics skips PinSetupScreen (validates Bug 9)
1. Enable biometrics (creates PIN)
2. Disable biometrics from AccountScreen
3. Re-enable biometrics from AccountScreen
4. **Expected:** Toast "Biometric login enabled" — no PinSetupScreen navigation

### S6 — Sign-out clears PIN (validates Task 8)
1. Enable biometrics (set PIN)
2. Sign out
3. Sign back in
4. Toggle biometrics ON from AccountScreen
5. **Expected:** Navigates to PinSetupScreen (local hash was cleared by sign-out, so `hasPinStored()` returns false)

### S7 — Inactivity timer resets on touch (validates D3)
1. Enable biometrics
2. Leave app open, interact every 4 minutes
3. **Expected:** Lock never triggers (each touch resets the 5-minute timer)
4. Leave app open with no interaction for 6 minutes
5. **Expected:** Lock triggers automatically

---

## Notes for the Implementing LLM

1. **Task order is mandatory.** Tasks 1–3 create files imported by Tasks 4–9. Do not reorder.

2. **`COLORS.primary_100` vs `primary_200`:** The original `LockScreen.tsx` referenced `COLORS.primary_100` in `biometricBtn`. The plan's replacement uses `COLORS.primary_200` (confirmed in CLAUDE.md color table). If `primary_100` exists in `constants/colors.ts`, you may use it instead — but `primary_200` is always safe.

3. **`secureStoreGetItem` / `secureStoreSetItem` / `secureStoreRemoveItem` names:** Confirmed from `lib/persistedStorageConfig.ts`. Run the prerequisite grep before writing `lib/pinStorage.ts` in case these names differ.

4. **`userData.hasPin` field:** The backend user profile may include `hasPin: boolean`. Check `src/api/types.ts` for the `UserProfile` type. If absent, add `hasPin?: boolean` to that type. If the API never returns it, the `typeof safeUser.hasPin === "boolean" ? safeUser.hasPin : false` fallback evaluates to `false` — this means `handleBiometricToggle` will always navigate to PinSetupScreen, which is the safe fallback.

5. **`POST /auth/toggle-biometrics` is now unused.** Do not call it anywhere. The endpoint, hook (`useToggleBiometricsMutation`), and types can remain in `src/api/` for now — removing them is a follow-up cleanup.

6. **`biometric-lock-package/` directory** at the project root is dead code (nothing imports from it). Delete it in a follow-up PR.

7. **`contexts/user-inactivity/useUserInactivity.tsx`** is an empty file. Delete it in the same cleanup PR.

8. **Settings JSON migration:** `SettingsProvider` stores settings as JSON in AsyncStorage. Existing users have `faceIdEnabled`, `fingerprintEnabled`, `appLockEnabled`, `appLockRequireFaceId` in their stored JSON. After Task 9, `JSON.parse` of that old string produces an object with extra keys that TypeScript doesn't know about — this is harmless. The extra keys are silently ignored when `setSettings` merges the value into `SettingsState`. No migration script needed.

9. **The `useFocusEffect` import in `AccountScreen`:** If after Task 7's `useFocusEffect` simplification the `useFocusEffect` body only calls async code, check that the `useCallback` still returns the cleanup function (`return () => { active = false; }`). React Native's `useFocusEffect` requires the callback to either return nothing or return a cleanup function — an `async` callback returns a Promise, which is wrong. The implementation shown in Task 7 Step 6 uses a non-async outer callback that calls an inner `async` function — this pattern is correct.

# Outstanding work

Compiled 2026-08-16 from a working session on the wallet, auth and app-lock code.
Last updated 2026-08-16. Ordered by severity. Each item names where it lives and
what "done" looks like. Completed items are at the bottom, numbers kept stable.

Related: `notes.md` (informal API notes), `docs/api-captures/` (live response
captures — trust these over Postman).

---

## P0 — Blocks release

### 2. Forgot-password flow never resets the password 🔴

**Where:** `screens/OtpVerificationScreen.tsx`, `screens/ResetPasswordScreen.tsx`

Three screens; only the first talks to the server.

| Step | Screen | State |
|---|---|---|
| 1 | `ForgotPasswordScreen` | ✅ Calls `/auth/request-reset`, sends the OTP, passes `email` as a route param |
| 2 | `OtpVerificationScreen` | ❌ Accepts any 6 digits, never verifies them, and **drops the `email` param** — `useLocalSearchParams` is never called |
| 3 | `ResetPasswordScreen` | ❌ `handleSubmit` just does `router.replace("/signIn")`. **The password is never sent anywhere.** |

`useResetPasswordMutation` (`src/api/hooks/useAuthApi.ts:174`) is referenced by
**zero files**.

**User impact:** they receive a real OTP email, type it in, set a new password,
see no error, land on sign-in — and the password is unchanged. Nothing tells
them it failed.

The contract is already right: `ResetPasswordRequest` is
`{ email, otp, newPassword }`. All three values exist in the flow, they are just
never threaded together or sent.

**Open questions before building:**
- There is no `verify-otp` endpoint in `src/api/endpoints.ts`. Without one, step
  2 cannot validate the code, so a wrong OTP is only discovered *after* the user
  has typed a new password — on the wrong screen. Ask the backend for one, or
  design step 3 to handle the rejection gracefully.
- `/auth/reset-password`'s live response shape is **unverified**. Every other
  auth endpoint moved to a `{status, message, data}` envelope on 2026-08-16;
  this one was not re-probed because probing sends a real OTP email.

**Done when:** a forgotten password can actually be reset end to end, with a
wrong OTP producing a clear error on the screen where it was entered.

---

## P1 — Correctness

### 2a. App lock on Android may still fire during permission dialogs

**Where:** `contexts/app-lock/AppLockContext.tsx` (AppState listener)

The iOS half is done (see Done §A3) — the listener now ignores `"inactive"`.

**Android does not emit `"inactive"`** — it is iOS-only in React Native. A
runtime permission dialog there can pause the activity and report
`"background"` outright, so that fix does not cover it. Needs a grace period
instead: record `backgroundedAt`, and on return to `"active"` only lock if more
than ~30s has elapsed.

The same grace period fixes a separate annoyance on both platforms — switching
to Messages to copy an OTP currently locks the app, right in the middle of the
forgot-password and KYC flows.

**Verify on a real Android device** which AppState value a permission dialog
actually produces before building this; the behaviour varies by version.

### 2b. No privacy overlay for the app-switcher snapshot

**Where:** net-new; nothing exists today

Now that the app does not lock on `"inactive"`, the app-switcher snapshot shows
whatever was on screen — including balances and transactions. The usual fix is
a blur/logo overlay rendered while the app is inactive, which dismisses itself
without re-auth. This is *not* the lock screen and should not require a PIN.

Note `contexts/user-inactivity/useUserInactivity.tsx` is an **empty file**
mounted nowhere, and CLAUDE.md §5 describes it as already doing this job
("Locks the app after 5 minutes of background time. Shows privacy overlay when
backgrounded"). None of that exists — the docs are wrong and should be
corrected alongside this.

### 3. `biometricEnabled` vs `biometricsEnabled`

**Where:** `contexts/app-lock/AppLockContext.tsx`, `screens/PinSetupScreen.tsx`; see `docs/api-captures/auth-endpoints.md` §1

`/auth/profile` now returns **both** keys with the same value, and
`/auth/toggle-biometrics` writes the **plural** one. The app reads the
**singular** one everywhere.

If the backend drops the singular key, `biometricEnabled` becomes `undefined`,
`?? false` kicks in, and **the app lock silently stops arming** — no error, no
crash, just a lock that never engages. Confirm which key is authoritative before
switching, and do not switch piecemeal.

### 4. `hasDoneInitialCheck` never resets on sign-out

**Where:** `contexts/app-lock/AppLockContext.tsx:76,129`

The ref guards the initial lock check and is never reset. `AppLockProvider` sits
above the navigator so it does not unmount on sign-out — meaning a **second
sign-in within the same app session skips the initial lock check entirely**. The
app then only locks on the next background or inactivity timeout, not at launch.

### 5. `/wallet/balance` — hook and consumers disagree

**Where:** `src/api/hooks/useWalletApi.ts:84`, `screens/HomeScreen.tsx:114`, `screens/TransferScreen.tsx:99`

The hook types it `ApiEnvelope<WalletBalance>` (`{data:{balance}}`); both
consumers read it flat as `balanceData?.balance`. It type-checks either way only
because `ApiEnvelope` carries `[key: string]: unknown`.

If the envelope is real, **the balance silently renders ₦0** and
`isInsufficient` blocks every transfer. Never captured by the probe — needs one
live authenticated call to settle.

### 6. PIN key-stretching iterations are unmeasured

**Where:** `lib/pinStorage.ts` (`ITERATIONS`)

Set to 1,000. Each round is a JS↔native bridge call via `expo-crypto`
(no PBKDF2 available), so cost is bridge latency rather than CPU. Measure unlock
time on a real low-end Android device and raise it as far as the budget allows.

---

## P2 — Backlog

### 7. `/wallet/lookup-recipient` is captured but unwired
Documented at `docs/api-captures/wallet-endpoints.md:2358` with a confirmed 200
response. No endpoint, no type, no hook. Needed for Zorah-to-Zorah transfers.

### 8. Ask the backend for `pinVersion` on `/auth/profile`
An integer bumped on every `set-pin` would let a device detect that the PIN
changed elsewhere and drop its stale local cache immediately. Without it, the
cache is bounded by a 7-day TTL (`PIN_CACHE_TTL_MS`) and a PIN changed on
device B keeps working on device A until it expires.

### 9. Re-probe `/auth/request-reset` and `/auth/reset-password`
The only captures are from 2026-05-01 and predate the `status` envelope. Both
are typed from stale data. Probing sends real email, so use a throwaway account.

### 10. TransferScreen PIN sheet is a stub
`screens/TransferScreen.tsx:147` — `// TODO: submit the transfer with the PIN
once the transfer API is wired`. It collects a PIN, verifies nothing, and
navigates straight to the success screen.

### 11. Pre-existing build noise
- `lib/localNotifications.test.ts` fails to compile — `Date` is not assignable to
  `NotificationTriggerInput` (`lib/localNotifications.ts:130,147`).
- `pnpm exec tsc --noEmit` reports 14 errors across unrelated files
  (`SlideUpModalRef` shape, `useSharedValue` imports, `AddBillReminderRequest`).
  Worth clearing so real regressions are visible.

### 12. Duplicate PIN-setup route
`app/(app)/profile/pin-setup.tsx` and `app/(app)/settings/pin.tsx` are
byte-identical wrappers around `PinSetupScreen`, both registered in
`app/(app)/_layout.tsx`. Everything now points at `settings/pin`, so the profile
route has **no consumers** — it can be deleted along with its `Stack.Screen`
entry. Two URLs for one screen is what made the broken link (Done §A6) hard to
spot.

### 13. Dead style blocks in `screens/AccountScreen.tsx`
- `rowIcon` — a 36px tinted circle for row icons, defined but never applied.
  Possibly an unfinished design; applying it would restyle every row on the
  screen, so it needs a deliberate decision rather than a drive-by.
- Confirm-modal styles were also dead until Done §A7 wired them up.

---

## ✅ Done — 2026-08-16

### A1. Cross-device PIN sync with offline verification
Server is the source of truth (`isPinSet`); the local record is an offline
verifier cache. Signing in on a new device now shows the **lock screen** and
restores the PIN from the server, instead of wrongly offering "Set Up PIN".
Cache is salted and key-stretched (was an unsalted SHA256), with transparent
v1→v2 migration. `lib/pinStorage.ts`, `contexts/app-lock/AppLockContext.tsx`.

### A2. `signOut` now clears the local PIN 🔒
It previously did not, so on a shared device **user A's PIN unlocked user B's
session**. `contexts/auth-context/SessionProvider.tsx`.

### A3. Brute-force lockout on PIN entry
5 free attempts, then 30s → 2m → 10m → 30m, persisted so force-quitting does not
clear a cooldown. Replaces the rate limiting that was implicitly provided by
server-side verification. `lib/pinLockout.ts` (+ 13 tests).

### A4. "Forgot PIN" is a real reset (was item 1)
Verifies the account password on the lock screen via `useLoginUserMutation`,
adopts the rotated tokens, then routes to PIN setup — no sign-out. A no-relock
window (`beginPinReset`/`endPinReset`) stops the inactivity timer stranding the
user mid-setup. Sign-out remains as a secondary escape.

### A5. App lock no longer fires on `"inactive"` (iOS half of 2a)
Permission dialogs, Face ID prompts, Control Centre and the app-switcher peek
no longer lock the app. This was interrupting voice expense logging the moment
it asked for the microphone. Android still needs the grace period — see 2a.

### A6. Inactivity timeout 60s → 3 min, and "Change PIN" links somewhere
`handleNavigate` now takes `Href` instead of `string`; the old
`path as RelativePathString` cast was defeating typed routes, which is how
Change PIN shipped pointing at `/(app)/(home)/profile/pin-setup` — a path that
does not exist. All five nav targets in the screen are now compile-checked.

### A7. Sign-out confirmation modal, and a distinct Change PIN icon
Logout now confirms before signing out, built on the confirm-modal styles that
already existed in the file unused. Change PIN uses a keypad glyph instead of
duplicating Change Password's padlock.

### A8. Auth types rebuilt from live captures
`hasPin` → `isPinSet` (the backend renamed it before 2026-05-01; the type
outlived the field), removed the phantom top-level `stepsCompleted`, and typed
`set-pin` / `verify-pin` / `toggle-biometrics` from the new `{status, message,
data}` envelope. Captured in `docs/api-captures/auth-endpoints.md`.

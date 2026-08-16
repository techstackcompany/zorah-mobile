# Auth API Response Captures

Captured live against `https://getzorah.com/api` on **2026-08-16** using a test
account (`johnb@gmail.com`). Sensitive values are redacted.

> **These supersede the 2026-05-01 entries in `zorah-api-responses.json` for
> every endpoint below.** The auth responses changed shape between the two
> runs. Treat this file as the source of truth and re-probe before trusting it
> again — this backend has now changed response shapes three times under us.

---

## ⚠️ 1. `GET /auth/profile` — the payload changed

This is the important one, because `UserProfile` is consumed all over the app.

### What changed since the 2026-05-01 capture

| Key | May 2026 | 2026-08-16 | Notes |
|---|---|---|---|
| `pin` | present (redacted hash) | **removed** | The account's PIN hash is no longer returned. A security improvement — nothing should have been reading it. |
| `isPinSet` | absent | **added** (`boolean`) | Server-side "this account has a PIN". |
| `biometricsEnabled` | absent | **added** (`boolean`) | Note the **plural**. Duplicates `biometricEnabled`. |
| `walletId` | absent | **added** (`string`) | e.g. `"1113307039"`. |
| everything else | — | unchanged | `onboarding`, `usageMetrics`, `_id`, `firstName`, `lastName`, `email`, `phoneNumber`, `biometricEnabled`, `KycStatus`, `preferredReminderHour`, `authProvider`, `fcmTokens`, `createdAt`, `updatedAt`, `__v`, `refreshToken` |

### Two traps this exposed in `src/api/types.ts`

1. **`hasPin` was renamed to `isPinSet`.** The backend used to return `hasPin`,
   which is why `UserProfile` declared it. It was replaced by `isPinSet` at
   some point **before the 2026-05-01 capture** — neither that capture nor the
   2026-08-16 one contains `hasPin`. The frontend type outlived the field by at
   least three months.

   This is the more dangerous kind of drift: the type was *correct when
   written*. Because it was optional, nothing broke and nothing warned —
   consumers would simply have read `undefined` forever. Now corrected to
   `isPinSet`.
2. **Top-level `stepsCompleted` is gone too.** `UserProfile` declared
   `stepsCompleted?: string[]`, but in both captures the key appears **only**
   nested inside `onboarding` — it was likely moved there at some point, the
   same way `hasPin` was renamed. Every real consumer already reads
   `onboarding.stepsCompleted` (see `hooks/useSetupProgress.ts:30`), so the
   top-level declaration was dead either way. Now removed.

### ⚠️ `biometricEnabled` vs `biometricsEnabled`

The response now carries **both**, with the same value:

```json
"biometricEnabled": true,
"biometricsEnabled": true
```

`POST /auth/toggle-biometrics` writes and returns the **plural** one
(`data.biometricsEnabled`), while the app reads the **singular** one
everywhere — `contexts/app-lock/AppLockContext.tsx` (lines 66, 120, 185) and
`screens/PinSetupScreen.tsx` (lines 41, 57, 65).

This looks like a rename mid-migration. **If the backend drops the singular
key, the app lock silently stops working** — `biometricEnabled` becomes
`undefined`, `?? false` kicks in, and the lock never arms. Confirm which key is
authoritative before switching, and do not switch piecemeal.

### Full response (200)

```json
{
  "onboarding": {
    "incomeSource": ["Business", "Salary", "Online Income"],
    "financialGoals": ["Save for Rent", "Buy a New Gadget", "Mobility Goals"],
    "currentStep": "completed",
    "stepsCompleted": ["goals", "income", "kyc", "integration"],
    "hasCompletedOnboarding": true
  },
  "usageMetrics": {
    "aiSessionsCount": 0,
    "expensesLoggedCount": 0,
    "isFeatureLocked": false,
    "lastInteractionDate": "2026-08-13T16:53:40.051Z"
  },
  "_id": "6a7df694d9369b429c6ee150",
  "firstName": "John",
  "lastName": "Babatunde",
  "email": "johnb@gmail.com",
  "phoneNumber": "08188843556",
  "biometricEnabled": true,
  "isPinSet": true,
  "biometricsEnabled": true,
  "KycStatus": "verified",
  "preferredReminderHour": 9,
  "authProvider": "local",
  "fcmTokens": [],
  "createdAt": "2026-08-13T16:53:40.051Z",
  "updatedAt": "2026-08-16T10:42:06.112Z",
  "__v": 0,
  "walletId": "1113307039",
  "refreshToken": "[REDACTED]"
}
```

---

## 2. `POST /auth/set-pin`

Body: `{ "pin": "4920" }`.

### `currentPassword` is NOT required

Probed both ways on 2026-08-16, back to back:

| Body sent | Status |
|---|---|
| `{ "pin": "4920" }` | **200** |
| `{ "pin": "4920", "currentPassword": "…" }` | **200** |

The endpoint accepts the PIN alone. An extra `currentPassword` is ignored
rather than rejected. A plan to gate PIN setup behind a password re-auth screen
was cancelled on this evidence — do not reintroduce it without re-probing.

### Response (200)

```json
{
  "status": "success",
  "message": "PIN updated successfully",
  "data": { "isPinSet": true }
}
```

Was `{"message":"PIN set successfully"}` in May — both the envelope and the
message text changed.

---

## 3. `POST /auth/verify-pin`

Body: `{ "pin": "4920" }` — **only** `pin`. It does not take `currentPassword`,
which is why `VerifyPinRequest` must not be an alias of `SetPinRequest`.

**Success (200)** — never captured before this run:

```json
{ "status": "success", "verified": true }
```

**Wrong PIN (401):**

```json
{ "status": "failed", "message": "Invalid PIN" }
```

Was `{"message":"Incorrect PIN"}` in May — the message text changed, so do not
match on it. `contexts/app-lock/AppLockContext.tsx:155` already treats any
throw as "wrong PIN", which is the right approach.

---

## 4. `POST /auth/toggle-biometrics`

Body: `{ "enabled": true }`.

**Response (200):**

```json
{
  "status": "success",
  "message": "Biometrics setting updated successfully",
  "data": { "biometricsEnabled": true }
}
```

Note it returns the **plural** key — see the warning under §1.

---

## Not re-probed

- `POST /auth/request-reset` — skipped deliberately, since it sends a real OTP
  email. Its May capture was flat `{"message":"OTP sent successfully to your
  email"}`; given every sibling endpoint moved to the `status` envelope, assume
  that shape is stale and re-probe before relying on it.

## Reproducing

```bash
pnpm exec node scripts/api-probe.js
```

Or hit a single endpoint directly with a bearer token from `POST /auth/login`.
`set-pin` **mutates** the account's PIN — use a test account, not a real one.

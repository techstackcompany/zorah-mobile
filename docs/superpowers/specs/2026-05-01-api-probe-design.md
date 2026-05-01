# API Probe — Design Spec

**Date:** 2026-05-01  
**Goal:** Systematically fetch every Zorah backend endpoint, capture real request/response pairs, and use the captures to audit and fix frontend type/endpoint mismatches in `src/api/types.ts`, `src/api/endpoints.ts`, and consuming hooks/screens.

---

## 1. Problem

Backend API responses evolve without always being reflected in the frontend TypeScript types or endpoint configs. This causes silent runtime bugs — wrong field names, missing fields, mismatched HTTP methods, and URL path errors. The goal is a single authoritative reference of what the API actually returns, used to drive a systematic fix pass.

---

## 2. Approach

A Node.js runner script (`scripts/api-probe.js`) authenticates with two accounts, calls every endpoint in the Postman collection, and writes the results to `docs/api-captures/zorah-api-responses.json`. Claude then cross-references that file against `src/api/types.ts` and `src/api/endpoints.ts` and implements all fixes.

---

## 3. Accounts

| Role | Email | Password | Purpose |
|---|---|---|---|
| Main account | `akeemmudash@gmail.com` | `12345678` | Has completed onboarding — used for all data endpoints |
| Test account | Generated at runtime (`zorah-probe-<timestamp>@test.com`) | `TestPass123!` | Fresh account — used for registration, set-pin, and onboarding endpoints |

Both tokens are stored in memory during the run. Tokens and passwords are **redacted** in the JSON output file before writing.

---

## 4. Runner Script — `scripts/api-probe.js`

**Runtime:** Node.js 18+ (uses native `fetch`).  
**No extra npm dependencies.**

### Phase sequence

| Phase | Description |
|---|---|
| 0 | Config — set `BASE_URL`, credentials, generate test email |
| 1 | Register test account → login → store `testToken` |
| 2 | Login with main account → store `mainToken` |
| 3 | Probe auth/user endpoints |
| 4 | Create test data on test account (expense, income, budget, bill, savings goal) |
| 5 | Probe all list/read endpoints on main account |
| 6 | Probe single-item endpoints using IDs from Phase 4 |
| 7 | Probe update endpoints (PATCH/PUT) on Phase 4 items |
| 8 | Probe delete/archive endpoints on Phase 4 items |
| 9 | Redact secrets → write JSON capture file |

### Error handling

Every endpoint call is wrapped in `try/catch`. A failed call records `{ statusCode, error }` and the run continues. At the end, any failed endpoints are printed as a summary so they can be manually verified.

### Endpoints covered

#### Auth / User (Phase 3)
- `POST /auth/register` — test account (Phase 1)
- `POST /auth/login` — both accounts (Phases 1 & 2)
- `GET /auth/profile` — main token
- `POST /auth/set-pin` — test token
- `POST /auth/verify-pin` — test token
- `POST /auth/toggle-biometrics` — test token
- `PATCH /auth/onboarding` — test token (account hasn't completed onboarding)
- `POST /auth/reset-usage` — main token
- `GET /auth/update-profile` — main token (expected to fail or return wrong shape — documenting actual behaviour)
- `POST /auth/request-reset` — no auth (uses test email)
- `POST /auth/refresh-token` — no auth (uses refresh token from Phase 1)

#### Expenses (Phases 4–8)
- `POST /expenses/add-expense`
- `GET /expenses/get-expense`
- `GET /expenses/summary?type=monthly`
- `GET /expenses/daily`
- `GET /expenses/monthly`
- `GET /expenses/spending-overview?timeframe=monthly`
- `GET /expenses/:id`
- `PUT /expenses/:id`
- `PATCH /expenses/:id/archive`
- `PATCH /expenses/:id/restore`
- `DELETE /expenses/:id`
- `POST /voice/log-expense`

#### Income (Phases 4–8)
- `POST /income/add-income`
- `GET /income/get-income`
- `GET /income/:id`
- `PUT /income/:id`
- `DELETE /income/:id`

#### Budgets (Phases 4–8)
- `POST /budgets`
- `GET /budgets/get-budgets`
- `GET /budgets/archived`
- `GET /budgets/:id`
- `PATCH /budgets/:id`
- `PATCH /budgets/:id/archive`
- `PATCH /budgets/:id/restore`
- `DELETE /budgets/:id`

#### Bills (Phases 4–8)
- `POST /bills/add-bill`
- `GET /bills`
- `PATCH /bills/:id/pay`
- `PATCH /bills/:id` *(Postman shows `bills/bills/:id` — probing both paths to identify which is correct)*

#### Notifications (Phase 5)
- `GET /notifications/get-not`
- `PATCH /notifications/:id/read` *(using first notification ID from GET response)*
- `POST /notifications/register-token`

#### Savings (Phases 4–8)
- `POST /savings/create`
- `POST /savings/contribute`
- `GET /savings/get-goals`
- `GET /savings/:id`
- `PUT /savings/:id`

#### Wallet (Phase 5)
- `GET /wallet/transactions`
- `GET /wallet/overview`
*(Deposit and withdraw are skipped — real money movement)*

#### Categories (Phase 5)
- `GET /categories?type=expense`
- `GET /categories?type=income`
- `GET /categories?type=budget`
- `GET /categories?type=savings`
- `GET /categories/subcategories`
- `GET /categories/by-type?type=income` *(Postman alternative path — probing to check if it differs)*

#### AI (Phase 5)
- `POST /ai/ask`
- `GET /ai/tips`

#### KYC (skipped)
- KYC submit requires file uploads and real identity data — excluded from automated probing.

---

## 5. Capture File — `docs/api-captures/zorah-api-responses.json`

```json
{
  "capturedAt": "<ISO timestamp>",
  "baseURL": "https://getzorah.com/api",
  "testAccountEmail": "zorah-probe-<timestamp>@test.com",
  "endpoints": [
    {
      "domain": "auth",
      "name": "login",
      "method": "POST",
      "path": "/auth/login",
      "requestBody": { "email": "[REDACTED]", "password": "[REDACTED]" },
      "statusCode": 200,
      "responseBody": { "accessToken": "[REDACTED]", "refreshToken": "[REDACTED]", "user": { "_id": "...", "name": "...", "email": "..." } },
      "error": null,
      "notes": ""
    }
  ]
}
```

**Redaction rules:**
- `password`, `pin`, `accessToken`, `refreshToken`, `bvn`, `nin`, `token` fields → `"[REDACTED]"`
- Request bodies containing these fields are redacted before writing

---

## 6. Cross-Reference Audit

After the script completes, Claude reads `zorah-api-responses.json` and produces a fix list by comparing:

| Check | Source |
|---|---|
| HTTP method correct? | `endpoints.ts` vs method actually used in the probe call |
| URL path correct? | `endpoints.ts` vs path actually used in the probe call |
| Request body fields complete? | `types.ts` request interfaces vs Postman bodies |
| Response fields match types? | `types.ts` response interfaces vs actual `responseBody` |
| Endpoint missing from `endpoints.ts`? | Postman collection vs `endpoints.ts` |

All fixes are implemented in `endpoints.ts`, `types.ts`, and any hooks or screens consuming the wrong shape. Changes are committed in a single `fix(api): align types and endpoints with live API responses` commit.

---

## 7. Known Issues (Pre-identified from Postman review)

These are already spotted before running — the probe will confirm and may find more:

| Endpoint | Issue |
|---|---|
| `auth/update-profile` | Listed as `GET` in Postman with no body — likely `PATCH`. Missing from `endpoints.ts` entirely. |
| `auth/onboarding` request body | `types.ts` has `{ step, data: { ... } }` wrapper; Postman shows flat `{ incomeSource, incomeRange, financialGoals }` |
| `auth/register` request body | `types.ts` missing `pin` and `preferredReminderHour` fields |
| `auth/reset-password` request body | `types.ts` has `{ token, newPassword }`; Postman shows `{ email, otp, newPassword }` |
| `notifications/register-token` | `types.ts` uses `fcmToken`; Postman shows `expoPushToken` |
| `bills` update path | Postman shows `bills/bills/:id` (double prefix); `endpoints.ts` uses `bills/:id` — one is wrong |
| `categories/by-type` | In Postman but absent from `endpoints.ts` |
| `expenses/:id` update | `endpoints.ts` uses `PATCH`; Postman shows `PUT` |

---

## 8. CLAUDE.md Addition

A new **"API Probe Script"** section to be added documenting:
- **Run:** `node scripts/api-probe.js` from the project root
- **Output:** `docs/api-captures/zorah-api-responses.json`
- **When to re-run:** After any backend deployment that may have changed response shapes, or when a screen shows unexpected empty/null data
- **Accounts used:** Main account (has data) + disposable test account (registered fresh each run)
- **What is skipped:** KYC (file upload), wallet deposit/withdraw (real money), Esusu (not in app yet)

---

## 9. Out of Scope

- Esusu endpoints — feature not built in the app yet
- Wallet deposit/withdraw — real money movement
- KYC submit — requires file upload and real identity data
- `POST /auth/reset-password` — requires a live OTP from email; the probe calls `request-reset` only and documents the expected shape from Postman
- Webhooks (XpressWallet) — require HMAC signing and external event triggers

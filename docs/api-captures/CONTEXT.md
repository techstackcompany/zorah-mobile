# API Probe — Continuation Context

> Read this file first if you are picking up this work mid-session.

## What this project is

We are building a Node.js script that probes every Zorah backend endpoint, captures live request/response pairs, and uses the captures to fix type/endpoint mismatches in the frontend.

## Files in this directory

| File | Purpose |
|---|---|
| `zorah-endpoints-reference.json` | Source of truth for all API endpoints — every endpoint to probe is defined here (renamed from Zorah.postman_collection.json to avoid .gitignore) |
| `zorah-api-responses.json` | **Generated output** — created when `node scripts/api-probe.js` is run. May not exist yet. |
| `CONTEXT.md` | This file |

## Key docs

| File | Purpose |
|---|---|
| `docs/superpowers/specs/2026-05-01-api-probe-design.md` | Full design spec — why we're doing this, what the script does, what the output looks like |
| `docs/superpowers/plans/2026-05-01-api-probe.md` | Step-by-step implementation plan — follow this to execute |

## Current status

- [x] Design spec written and approved
- [x] Implementation plan written
- [x] Postman collection copied to `docs/api-captures/`
- [ ] `scripts/api-probe.js` — NOT YET CREATED (Task 1 of the plan)
- [ ] `docs/api-captures/zorah-api-responses.json` — NOT YET GENERATED (Task 2)
- [ ] `src/api/endpoints.ts` fixes — NOT YET DONE (Task 3)
- [ ] `src/api/types.ts` fixes — NOT YET DONE (Task 4)
- [ ] Hook/screen consumer fixes — NOT YET DONE (Task 5)
- [ ] `CLAUDE.md` update — NOT YET DONE (Task 6)
- [ ] Final commits — NOT YET DONE (Task 7)

## Accounts

| Role | Email | Password |
|---|---|---|
| Main account (has real data) | `akeemmudash@gmail.com` | `12345678` |
| Test account | Generated fresh each run as `zorah-probe-<timestamp>@test.com` with password `TestPass123!` |

## Backend base URL

```
https://getzorah.com/api
```

## How to continue

1. Read `docs/superpowers/plans/2026-05-01-api-probe.md` — the full plan with exact code and commands
2. Start at **Task 1** — create `scripts/api-probe.js` using the code in the plan
3. Run the script (Task 2), then use the capture file to fix types (Tasks 3–5)
4. Update CLAUDE.md (Task 6) and commit (Task 7)

## Pre-identified type mismatches (from Postman review)

These are already known before running the script — fix these in Task 3/4 at minimum:

| File | Issue |
|---|---|
| `src/api/endpoints.ts` | `expenses.updateExpense` uses `PATCH` — Postman shows `PUT` |
| `src/api/endpoints.ts` | `auth/update-profile` missing entirely — needs to be added as `PATCH` |
| `src/api/endpoints.ts` | `billReminders.updateBill` uses `PUT` at `/bills/:id` — Postman shows `PATCH` at `bills/bills/:id` (double path, one is wrong) |
| `src/api/endpoints.ts` | `categories/by-type` endpoint missing |
| `src/api/types.ts` | `RegisterUserRequest` missing `pin` and `preferredReminderHour` |
| `src/api/types.ts` | `UpdateOnboardingRequest` has `{ step, data: {...} }` wrapper — Postman shows flat `{ incomeSource, incomeRange, financialGoals }` |
| `src/api/types.ts` | `ResetPasswordRequest` has `{ token, newPassword }` — Postman shows `{ email, otp, newPassword }` |
| `src/api/types.ts` | `RegisterNotificationTokenRequest` uses `fcmToken` — Postman shows `expoPushToken` |

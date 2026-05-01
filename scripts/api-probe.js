// scripts/api-probe.js
// Run: node scripts/api-probe.js
// Output: docs/api-captures/zorah-api-responses.json

const BASE_URL = "https://getzorah.com/api";
const MAIN_EMAIL = "akeemmudash@gmail.com";
const MAIN_PASSWORD = "12345678";
const TEST_EMAIL = `zorah-probe-${Date.now()}@test.com`;
const TEST_PASSWORD = "TestPass123!";
const SENSITIVE_KEYS = ["password", "pin", "accessToken", "refreshToken", "bvn", "nin", "token"];

const results = [];
let mainToken = null;
let testToken = null;
let testRefreshToken = null;
const createdIds = {};

function redact(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.includes(k) ? "[REDACTED]" : redact(v),
    ])
  );
}

async function probe({ domain, name, method, path, body, token, notes = "" }) {
  const url = `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let statusCode = null;
  let responseBody = null;
  let error = null;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    statusCode = res.status;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text();
    }
  } catch (err) {
    error = err.message;
  }

  const record = {
    domain,
    name,
    method,
    path,
    requestBody: redact(body ?? null),
    statusCode,
    responseBody: redact(responseBody),
    error,
    notes,
  };
  results.push(record);

  const ok = !error && statusCode >= 200 && statusCode < 300;
  console.log(`[${ok ? "OK  " : "FAIL"}] ${method.padEnd(6)} ${path} → ${statusCode ?? "network error"}`);

  return responseBody;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // ── Phase 1: Register + login test account ────────────────────────────────
  console.log("\n─── Phase 1: Register test account ───");
  await probe({
    domain: "auth", name: "register", method: "POST", path: "/auth/register",
    body: {
      firstName: "Zorah", lastName: "Probe", email: TEST_EMAIL,
      phoneNumber: "+2348000000001", password: TEST_PASSWORD,
      pin: "1234", preferredReminderHour: 9,
    },
  });

  const testLogin = await probe({
    domain: "auth", name: "login-test-account", method: "POST", path: "/auth/login",
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    notes: "Fresh test account — used for onboarding endpoints",
  });
  testToken = testLogin?.accessToken;
  testRefreshToken = testLogin?.refreshToken;
  if (!testToken) console.warn("WARNING: test token not obtained — some probes will be skipped");

  // ── Phase 2: Login main account ───────────────────────────────────────────
  console.log("\n─── Phase 2: Login main account ───");
  const mainLogin = await probe({
    domain: "auth", name: "login", method: "POST", path: "/auth/login",
    body: { email: MAIN_EMAIL, password: MAIN_PASSWORD },
  });
  mainToken = mainLogin?.accessToken;
  if (!mainToken) { console.error("ERROR: main token not obtained. Aborting."); process.exit(1); }

  // ── Phase 3: Auth endpoints ───────────────────────────────────────────────
  console.log("\n─── Phase 3: Auth endpoints ───");
  await probe({ domain: "auth", name: "profile", method: "GET", path: "/auth/profile", token: mainToken });

  if (testToken) {
    await probe({ domain: "auth", name: "set-pin", method: "POST", path: "/auth/set-pin", body: { pin: "1234" }, token: testToken });
    await probe({ domain: "auth", name: "verify-pin", method: "POST", path: "/auth/verify-pin", body: { pin: "1234" }, token: testToken });
    await probe({ domain: "auth", name: "toggle-biometrics", method: "POST", path: "/auth/toggle-biometrics", body: { enabled: true }, token: testToken });
    await probe({
      domain: "auth", name: "onboarding", method: "PATCH", path: "/auth/onboarding",
      body: { incomeSource: "Freelancing", incomeRange: "₦200,000 - ₦500,000", financialGoals: ["Build Emergency Fund"] },
      token: testToken,
      notes: "Used test account (has not completed onboarding). Postman body is flat — no step/data wrapper.",
    });
  }

  await probe({ domain: "auth", name: "reset-usage", method: "POST", path: "/auth/reset-usage", token: mainToken });
  await probe({
    domain: "auth", name: "update-profile", method: "GET", path: "/auth/update-profile", token: mainToken,
    notes: "Postman shows GET with no body — suspected wrong method. Documenting actual response to determine correct method.",
  });
  await probe({ domain: "auth", name: "request-reset", method: "POST", path: "/auth/request-reset", body: { email: TEST_EMAIL } });
  if (testRefreshToken) {
    await probe({ domain: "auth", name: "refresh-token", method: "POST", path: "/auth/refresh-token", body: { refreshToken: testRefreshToken } });
  }

  // ── Phase 4: Create test data ─────────────────────────────────────────────
  console.log("\n─── Phase 4: Create test data ───");
  const probeToken = testToken ?? mainToken;

  const expenseRes = await probe({
    domain: "expenses", name: "add-expense", method: "POST", path: "/expenses/add-expense",
    body: { amount: 5000, category: "Food", description: "API probe test", paymentMethod: "Cash", date: today },
    token: probeToken,
  });
  createdIds.expense = expenseRes?.data?._id ?? expenseRes?._id;

  const incomeRes = await probe({
    domain: "income", name: "add-income", method: "POST", path: "/income/add-income",
    body: { source: "Salary", amount: 100000, category: "salary", description: "API probe test", date: today },
    token: probeToken,
  });
  createdIds.income = incomeRes?.data?._id ?? incomeRes?._id;

  const budgetRes = await probe({
    domain: "budgets", name: "create-budget", method: "POST", path: "/budgets",
    body: {
      category: "Food", amount: 50000, period: "monthly",
      startDate: today, endDate: future,
      month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    },
    token: probeToken,
  });
  createdIds.budget = budgetRes?.budget?._id ?? budgetRes?._id;

  const billRes = await probe({
    domain: "bills", name: "add-bill", method: "POST", path: "/bills/add-bill",
    body: { name: "Probe Bill", amount: 2000, dueDate: future, category: "Daily Living & Utilities", paymentMethod: "Bank Transfer", reminderEnabled: false },
    token: probeToken,
  });
  createdIds.bill = billRes?.data?._id ?? billRes?._id ?? billRes?.bill?._id;

  const savingsRes = await probe({
    domain: "savings", name: "create-goal", method: "POST", path: "/savings/create",
    body: { title: "Probe Goal", targetAmount: 50000, deadline: future, description: "API probe test" },
    token: probeToken,
  });
  createdIds.savings = savingsRes?.goal?._id ?? savingsRes?.data?._id ?? savingsRes?._id;

  console.log("  Created IDs:", createdIds);

  // ── Phase 5: List / read endpoints ───────────────────────────────────────
  console.log("\n─── Phase 5: List/read endpoints ───");
  await probe({ domain: "expenses", name: "get-expenses", method: "GET", path: "/expenses/get-expense", token: mainToken });
  await probe({ domain: "expenses", name: "expenses-summary", method: "GET", path: "/expenses/summary?type=monthly", token: mainToken });
  await probe({ domain: "expenses", name: "expenses-daily", method: "GET", path: "/expenses/daily", token: mainToken });
  await probe({ domain: "expenses", name: "expenses-monthly", method: "GET", path: "/expenses/monthly", token: mainToken });
  await probe({ domain: "expenses", name: "spending-overview", method: "GET", path: "/expenses/spending-overview?timeframe=monthly", token: mainToken });

  await probe({ domain: "income", name: "get-income", method: "GET", path: "/income/get-income", token: mainToken });

  await probe({ domain: "budgets", name: "get-budgets", method: "GET", path: "/budgets/get-budgets", token: mainToken });
  await probe({ domain: "budgets", name: "get-archived-budgets", method: "GET", path: "/budgets/archived", token: mainToken });

  await probe({ domain: "bills", name: "get-bills", method: "GET", path: "/bills", token: mainToken });

  const notifRes = await probe({ domain: "notifications", name: "get-notifications", method: "GET", path: "/notifications/get-not", token: mainToken });
  const firstNotifId = notifRes?.[0]?._id ?? notifRes?.data?.[0]?._id;

  await probe({
    domain: "notifications", name: "register-token", method: "POST", path: "/notifications/register-token",
    body: { expoPushToken: "ExponentPushToken[probe-test-token]" }, token: mainToken,
    notes: "Postman shows expoPushToken — types.ts currently uses fcmToken (mismatch)",
  });

  await probe({ domain: "savings", name: "get-goals", method: "GET", path: "/savings/get-goals", token: mainToken });
  await probe({ domain: "wallet", name: "get-transactions", method: "GET", path: "/wallet/transactions", token: mainToken });
  await probe({ domain: "wallet", name: "get-overview", method: "GET", path: "/wallet/overview", token: mainToken });

  await probe({ domain: "categories", name: "categories-expense", method: "GET", path: "/categories?type=expense", token: mainToken });
  await probe({ domain: "categories", name: "categories-income", method: "GET", path: "/categories?type=income", token: mainToken });
  await probe({ domain: "categories", name: "categories-budget", method: "GET", path: "/categories?type=budget", token: mainToken });
  await probe({ domain: "categories", name: "categories-savings", method: "GET", path: "/categories?type=savings", token: mainToken });
  await probe({ domain: "categories", name: "categories-subcategories", method: "GET", path: "/categories/subcategories", token: mainToken });
  await probe({
    domain: "categories", name: "categories-by-type", method: "GET", path: "/categories/by-type?type=income", token: mainToken,
    notes: "Postman alternative path — checking if this differs from /categories?type=income",
  });

  await probe({ domain: "ai", name: "ai-ask", method: "POST", path: "/ai/ask", body: { message: "How much did I spend this month?" }, token: mainToken });
  await probe({ domain: "ai", name: "ai-tips", method: "GET", path: "/ai/tips", token: mainToken });
  await probe({ domain: "voice", name: "voice-log-expense", method: "POST", path: "/voice/log-expense", body: { message: "I spent 2000 naira on lunch" }, token: mainToken });

  // ── Phase 6: Single-item endpoints ───────────────────────────────────────
  console.log("\n─── Phase 6: Single-item endpoints ───");
  if (createdIds.expense) await probe({ domain: "expenses", name: "get-single-expense", method: "GET", path: `/expenses/${createdIds.expense}`, token: probeToken });
  if (createdIds.income) await probe({ domain: "income", name: "get-single-income", method: "GET", path: `/income/${createdIds.income}`, token: probeToken });
  if (createdIds.budget) await probe({ domain: "budgets", name: "get-single-budget", method: "GET", path: `/budgets/${createdIds.budget}`, token: probeToken });
  if (createdIds.savings) {
    await probe({ domain: "savings", name: "get-single-goal", method: "GET", path: `/savings/${createdIds.savings}`, token: probeToken });
    await probe({ domain: "savings", name: "contribute", method: "POST", path: "/savings/contribute", body: { goalId: createdIds.savings, amount: 5000 }, token: probeToken });
  }
  if (firstNotifId) await probe({ domain: "notifications", name: "read-notification", method: "PATCH", path: `/notifications/${firstNotifId}/read`, token: mainToken });

  // ── Phase 7: Update endpoints ─────────────────────────────────────────────
  console.log("\n─── Phase 7: Update endpoints ───");
  if (createdIds.expense) {
    await probe({
      domain: "expenses", name: "update-expense", method: "PUT", path: `/expenses/${createdIds.expense}`,
      body: { category: "Transport", amount: 3000, description: "Updated by probe", date: today }, token: probeToken,
      notes: "Postman shows PUT; endpoints.ts uses PATCH — verifying correct method",
    });
  }
  if (createdIds.income) {
    await probe({ domain: "income", name: "update-income", method: "PUT", path: `/income/${createdIds.income}`,
      body: { source: "Updated Source", amount: 120000, category: "salary", date: today }, token: probeToken });
  }
  if (createdIds.budget) {
    await probe({ domain: "budgets", name: "update-budget", method: "PATCH", path: `/budgets/${createdIds.budget}`,
      body: { category: "Food", amount: 60000, period: "monthly", startDate: today, endDate: future }, token: probeToken });
  }
  if (createdIds.bill) {
    await probe({
      domain: "bills", name: "update-bill-single-path", method: "PATCH", path: `/bills/${createdIds.bill}`,
      body: { name: "Updated Bill", amount: 3000, dueDate: future, category: "Daily Living & Utilities", reminderEnabled: false }, token: probeToken,
      notes: "Testing /bills/:id (endpoints.ts version)",
    });
    await probe({
      domain: "bills", name: "update-bill-double-path", method: "PATCH", path: `/bills/bills/${createdIds.bill}`,
      body: { name: "Updated Bill", amount: 3000, dueDate: future, category: "Daily Living & Utilities", reminderEnabled: false }, token: probeToken,
      notes: "Testing /bills/bills/:id (Postman version) — one of these two will 404",
    });
    await probe({ domain: "bills", name: "pay-bill", method: "PATCH", path: `/bills/${createdIds.bill}/pay`, token: probeToken });
  }
  if (createdIds.savings) {
    await probe({ domain: "savings", name: "update-goal", method: "PUT", path: `/savings/${createdIds.savings}`,
      body: { title: "Updated Probe Goal", targetAmount: 75000, deadline: future }, token: probeToken });
  }

  // ── Phase 8: Delete / archive ─────────────────────────────────────────────
  console.log("\n─── Phase 8: Delete/archive endpoints ───");
  if (createdIds.budget) {
    await probe({ domain: "budgets", name: "archive-budget", method: "PATCH", path: `/budgets/${createdIds.budget}/archive`, token: probeToken });
    await probe({ domain: "budgets", name: "restore-budget", method: "PATCH", path: `/budgets/${createdIds.budget}/restore`, token: probeToken });
    await probe({ domain: "budgets", name: "delete-budget", method: "DELETE", path: `/budgets/${createdIds.budget}`, token: probeToken });
  }
  if (createdIds.expense) {
    await probe({ domain: "expenses", name: "archive-expense", method: "PATCH", path: `/expenses/${createdIds.expense}/archive`, token: probeToken });
    await probe({ domain: "expenses", name: "restore-expense", method: "PATCH", path: `/expenses/${createdIds.expense}/restore`, token: probeToken });
    await probe({ domain: "expenses", name: "delete-expense", method: "DELETE", path: `/expenses/${createdIds.expense}`, token: probeToken });
  }
  if (createdIds.income) {
    await probe({ domain: "income", name: "delete-income", method: "DELETE", path: `/income/${createdIds.income}`, token: probeToken });
  }

  // ── Phase 9: Write capture file ───────────────────────────────────────────
  console.log("\n─── Phase 9: Writing capture file ───");
  const { writeFileSync, mkdirSync } = await import("fs");
  const { resolve } = await import("path");

  const outDir = resolve("docs/api-captures");
  const outPath = resolve(outDir, "zorah-api-responses.json");
  mkdirSync(outDir, { recursive: true });

  writeFileSync(outPath, JSON.stringify({
    capturedAt: new Date().toISOString(),
    baseURL: BASE_URL,
    testAccountEmail: TEST_EMAIL,
    endpoints: results,
  }, null, 2), "utf8");

  console.log(`\nCapture written to: ${outPath}`);

  const failed = results.filter(r => r.error || !r.statusCode || r.statusCode < 200 || r.statusCode >= 300);
  if (failed.length) {
    console.log("\n=== Failed endpoints ===");
    failed.forEach(r => console.log(`  ${r.method} ${r.path} → ${r.statusCode ?? "network error"} ${r.error ?? ""}`));
  }
  console.log(`\nDone: ${results.length} probed, ${failed.length} failed.`);
}

main().catch(console.error);

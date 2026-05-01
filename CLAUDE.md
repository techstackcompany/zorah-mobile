# CLAUDE.md

> Onboarding and reference document for engineers and AI agents working on this codebase.

---

## 1. Project Overview

**Zorah** is a personal finance mobile app targeting the Nigerian market. The npm package is named `zorah`; the display name in the App Store is `Zorah`. The repo folder is `pocketMonie` — do not confuse the folder name with the product name.

**Core features:**
- Expense & income tracking (manual + voice-to-text)
- Budget creation and monitoring with alerts
- Savings goals with contribution tracking
- FX rates monitoring with converter
- AI financial assistant (chat-based)
- Bill reminders
- Wallet top-up and transaction history
- KYC verification
- Biometric app lock with inactivity timeout
- Push notifications (Firebase + Expo)

**Target users:** Nigerian individuals managing personal finances (NGN is the primary currency).

---

## 2. Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Expo (managed → bare hybrid) | ~54.0.12 |
| Language | TypeScript (strict) | - |
| React | React 19 + React Native 0.81.4 | - |
| Routing | Expo Router (file-based) | - |
| Server state | TanStack Query v5 + AsyncStorage persister | 5.90.2 |
| HTTP | Axios | 1.12.2 |
| Styling | NativeWind (Tailwind CSS for RN) | - |
| Storage (sensitive) | expo-secure-store | - |
| Storage (general) | @react-native-async-storage/async-storage | 2.2.0 |
| Push notifications | Firebase Cloud Messaging + expo-notifications | - |
| Biometrics | expo-local-authentication | 17.0.7 |
| Charts | react-native-gifted-charts | - |
| Bottom sheet | @gorhom/bottom-sheet | - |
| Gestures | react-native-gesture-handler | - |
| Animations | react-native-reanimated | - |
| Voice input | expo-speech-recognition | 3.0.1 |
| Audio | expo-audio | - |
| Build | EAS Build | - |

**Notable constraints:**
- Portrait-only orientation (locked in `app.json`)
- Bundle ID: `com.onerendzina.zorah`
- React Compiler experiment enabled (`app.json`)
- TypedRoutes experiment enabled (`app.json`)
- Expo Router entry: `expo-router/entry` (set in `package.json` `main` field)
- Path alias `@/` maps to project root via `tsconfig.json`

---

## 3. Architecture

### Folder Structure

```
/
├── app/                    # Expo Router: file-based route definitions ONLY
│   ├── _layout.tsx         # Root provider tree (see Section 4)
│   ├── index.tsx           # Entry redirect
│   ├── (auth)/             # Unauthenticated stack
│   └── (app)/              # Authenticated stack
│       ├── _layout.tsx     # Fetches user profile on mount
│       └── (home)/         # Tab navigator (4 visible tabs)
│
├── screens/                # Actual screen implementations (back the app/ routes)
├── components/             # Reusable UI components
│   ├── ui/                 # Base primitives (Text, Button, Input, etc.)
│   ├── home/               # Home-screen-specific components
│   ├── expense-planning/   # Expense analytics components
│   ├── budget/             # Budget components
│   ├── fx/                 # FX rate components
│   ├── layouts/            # Shared layout wrappers
│   └── offline/            # OfflineNotice banner
│
├── contexts/               # React Context providers (auth, settings, network, etc.)
├── hooks/                  # App-level custom hooks (voice, setup progress, etc.)
├── providers/              # Non-context providers (fonts, toast config)
├── features/               # Domain logic (types, utils, hooks) per feature
│   ├── budget/
│   ├── expense-income/
│   └── fx/
│
├── src/
│   ├── api/
│   │   ├── client.ts       # Axios instance + token refresh interceptor
│   │   ├── endpoints.ts    # All API endpoint definitions
│   │   ├── types.ts        # Request/response TypeScript types
│   │   └── hooks/          # TanStack Query hooks per domain
│   └── config/
│       └── api.ts          # Axios base config objects
│
├── lib/                    # Pure utilities
│   ├── reactQuery.ts       # QueryClient + AsyncStorage persister
│   ├── persistedStorageConfig.ts  # SecureStore + AsyncStorage helpers
│   ├── utils.ts            # 40+ shared utility functions
│   └── queue.ts
│
├── constants/              # App-wide constants
├── navigation/
│   └── RootNavigator.tsx   # Auth guard using Stack.Protected
├── assets/                 # Fonts, icons, images, sounds
└── global.css              # NativeWind global stylesheet
```

### Architectural Pattern

**Dual-layer routing + screens separation:** Expo Router files in `app/` are thin — they import and render a screen component from `screens/`. This decouples the routing layer from implementation. It adds one extra file per route but keeps `app/` clean.

**Domain-driven feature modules:** Each business domain (budget, expense-income, fx) has a folder in `features/` containing its own `types.ts`, `utils.ts`, and `hooks.ts`. API hooks live separately in `src/api/hooks/`.

**Context-heavy global state:** Auth, settings, network, inactivity, and push notifications are all managed via React Context. Server state is entirely in TanStack Query.

### Key Design Decisions

- **SecureStore for tokens, AsyncStorage for everything else.** Never invert this.
- **All booleans in AsyncStorage are stored as strings** `"true"` / `"false"` due to `useAsyncStorageState` storing everything as strings. When reading, always compare `=== "true"`, not just truthiness.
- **`userData` is double-serialized** — stored as a JSON string in AsyncStorage. `SessionProvider` handles parsing. Do not directly read raw `userData` from the context; use `parsedUserData` (already parsed as `UserProfile`).
- **Offline-first queries:** React Query's `networkMode: "offlineFirst"` means queries run even without a network connection and serve cached data.

---

## 4. Application Flow

### Entry Point

```
app/_layout.tsx → RootLayout
  └── ChildrenComponent (provider tree, see below)
       └── RootNavigator (Stack.Protected guard)
```

### Provider Tree (top to bottom)

```
GestureHandlerRootView
  ReactQueryProvider (TanStack Query + AsyncStorage persister)
    NetworkProvider (online/offline status)
      SessionProvider (auth state + token management)
        PushNotificationsProvider (Firebase + Expo notifications)
          SettingsProvider (biometrics, privacy, preferences)
            FontProvider (loads custom fonts)
              SafeAreaProvider
                BottomSheetModalProvider
                  OfflineNotice
                  RootNavigator
              Toast (react-native-toast-message)
```

Order matters — `SessionProvider` must be inside `ReactQueryProvider` (calls `useQueryClient()`). `SettingsProvider` must be inside `SessionProvider`.

### Auth Guard (`navigation/RootNavigator.tsx`)

```tsx
<Stack.Protected guard={!isAuthenticated}>
  <Stack.Screen name="(auth)" />        // visible when NOT authenticated
</Stack.Protected>

<Stack.Protected guard={isAuthenticated}>
  <Stack.Screen name="(app)" />         // visible when authenticated
</Stack.Protected>
```

Guard waits for `isLoading` to be false before rendering anything — prevents flash of wrong screen.

### Auth Flow

```
Welcome → Sign In / Sign Up
  ↓ (if not onboarded)
Onboarding → Forgot Password (if needed)
  ↓ (authenticated)
(app) _layout.tsx fetches user profile → updates AuthContext
  ↓
Setup flow (if !hasCompletedSetup):
  Step 1: Financial Goals
  Step 2: Monthly Income
  Step 3: KYC Verification
  Step 4: Bank Integration
  ↓
Home Tabs (if hasCompletedSetup)
```

### Main Tab Navigation

4 visible tabs in `app/(app)/(home)/_layout.tsx`:
1. **Home** — dashboard, quick actions, recent transactions
2. **Budget** — budget list and creation
3. **Expenses** — expense planning/analytics
4. **Account** — profile, settings, preferences

2 hidden routes (accessible via navigation, not tabs):
- `fxRates` — FX rates screen
- `investment` — investments (placeholder)

---

## 5. State Management

### Auth State (`contexts/auth-context/`)

**Hook:** `useSession()` — use this everywhere, never access `AuthContext` directly.

| Field | Type | Storage | Description |
|---|---|---|---|
| `session` | `string \| null` | SecureStore | JWT access token |
| `isAuthenticated` | `boolean` | derived | `!!session` |
| `userData` | `UserProfile \| null` | AsyncStorage (JSON) | Full user profile |
| `hasOnboarded` | `boolean` | AsyncStorage | Completed onboarding |
| `isVerified` | `boolean` | AsyncStorage | Email/phone verified |
| `kycVerificationStatus` | `string` | AsyncStorage | "unverified" \| "pending" \| "verified" |
| `hasCompletedSetup` | `boolean` | AsyncStorage | Completed 4-step setup |
| `setupStep` | `number \| null` | AsyncStorage | Current setup step (1–4) |

**`signOut()`** clears all the above, removes React Query cache, and redirects to `/(auth)/signIn`.

**Token refresh failure** is wired in `SessionProvider` via `setTokenRefreshFailureHandler` — on 401 failure, calls `signOut()` and shows a native Alert.

### Settings State (`contexts/settings-context/`)

**Hook:** `useAppSettings()` — manages user preferences persisted in AsyncStorage as JSON under key `"appSettings"`.

Covers: biometric setup, app lock, privacy overlay, push notification opt-in, language, tour completion flags.

### Server / Remote State (TanStack Query)

All remote data lives here. Configuration in `lib/reactQuery.ts`:
- Stale time: 5 minutes
- GC time: 24 hours
- Max cache age: 2 days (persisted to AsyncStorage under `"rq:cache"`)
- Retry: 1 attempt
- Network mode: `"offlineFirst"`
- Cache buster: `"v1"` — bump this string to invalidate all persisted caches on next app start

### Network State (`contexts/network/`)

**Hook:** `useNetworkStatus()` — exposes `{ isOnline, lastChangedAt }`. Also wires TanStack Query's `onlineManager` to `expo-network` events.

### Inactivity Lock (`contexts/user-inactivity/`)

Locks the app after 5 minutes of background time (if biometric lock is enabled in settings). Shows privacy overlay when backgrounded.

---

## 6. API & Data Layer

### Base URLs

| Client | Base URL |
|---|---|
| `baseClient` | `https://getzorah.com/api` |
| `fxTipsClient` | `https://seal-app-jjgmw.ondigitalocean.app` |
| `countriesClient` | `https://countriesnow.space/api/v0.1` |

### Token Refresh Flow (`src/api/client.ts`)

The Axios response interceptor handles 401 errors automatically:
1. If not already refreshing: fires `POST /auth/refresh-token` with the stored refresh token
2. Queues all concurrent 401 failures in `failedQueue` while refresh is in-flight
3. On success: updates stored token, replays queued requests
4. On failure: clears all tokens, drains queue with error, calls `onTokenRefreshFailure` (triggers signOut + Alert)

Module-level `isRefreshing` and `failedQueue` are intentional singletons per JS runtime — they work correctly in RN's single-thread model.

Auth endpoints (`/auth/login`, `/auth/register`) are explicitly excluded from token injection and from the 401 refresh cycle.

### API Request Pattern

Every API call goes through `apiRequest<TResponse>(config, client?)` in `client.ts`. It unwraps `response.data` and normalizes errors through `handleApiError()`.

**Never call `baseClient.get(...)` directly in components.** Always use the React Query hooks.

### API Hook Pattern (`src/api/hooks/`)

```typescript
// Query (read)
export const useGetExpensesQuery = (options?) =>
  useQuery<ExpenseListResponse, ApiError>({
    queryKey: ['expenses', 'list'],
    queryFn: () => apiRequest({ ...API_ENDPOINTS.expenses.getExpenses }),
    ...options,
  });

// Mutation (write)
export const useAddExpenseMutation = (options?) =>
  useMutation<AddExpenseResponse, ApiError, AddExpensePayload>({
    mutationKey: ['expenses', 'add'],
    mutationFn: (payload) => apiRequest({ ...API_ENDPOINTS.expenses.addExpense, data: payload }),
    ...options,
  });
```

All hooks are exported from `src/api/hooks/index.ts`. Import from there, not individual files.

### Error Handling

API errors are typed as `ApiError`:
```typescript
interface ApiError {
  status?: number;      // HTTP status code
  message: string;      // Human-readable message
  data?: unknown;       // Raw response body
  raw?: AxiosError;     // Original Axios error
}
```

In screens/components: show `error.message` in a Toast or inline error state. For mutations, use `onError` option. Do not expose raw `error.data` or stack traces to the user.

### Caching Strategy

- **Reads** are cached per `queryKey` for 5 minutes stale / 24 hours GC
- **Mutations** should call `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess` to refresh affected queries
- **Offline**: stale cached data is served immediately; fresh fetch is backgrounded when online

---

## 7. UI System

### Styling: NativeWind + StyleSheet

Primary styling is Tailwind classes via NativeWind. Use `className` prop on React Native components. The Tailwind config imports custom colors from `constants/colors.ts` and custom font families.

For styles that can't be expressed in Tailwind (e.g., complex transforms, exact measurements from design), use `StyleSheet.create()` alongside `className`.

Use the `cn()` utility from `lib/utils.ts` to merge conditional class strings.

### Custom Text Component (`components/ui/Text.tsx`)

**Always use this instead of React Native's `<Text>`.**

```tsx
<Text family="degular" weight="semibold" className="text-lg text-textColor">
  Hello
</Text>
```

Props:
- `family`: `"degular"` | `"nunito"` (default)
- `weight`: `"regular"` | `"medium"` | `"semibold"` | `"bold"`
- `italic`: boolean
- `className`: Tailwind classes

### Color System (`constants/colors.ts`)

| Token | Hex | Usage |
|---|---|---|
| `primary_400` | `#1A43BE` | Primary blue, CTAs |
| `primary_200` | `#EAEFFF` | Light blue backgrounds |
| `secondary_500` | `#32A34D` | Success, income green |
| `secondary_100` | `#EBF9F3` | Light green backgrounds |
| `textColor` | `#2A3A50` | Primary text |
| `error` | `#EF4444` | Error states |
| `darkRed` | `#AF2B2B` | Critical warnings |
| `grey` | `#D9D9D9` | Borders, dividers |
| `light` | `#FDFCFB` | White-ish backgrounds |
| `lightBg` | `#EFEFEF` | Screen backgrounds |
| `peach` | `#BE5E1A` | Accent (budget) |
| `amber` | `#D59007` | Accent (savings) |
| `purple` | `#6165D7` | Accent (FX) |

### Typography (Font Families)

| Font | Use Case |
|---|---|
| Degular | Display text, headings, large amounts |
| Nunito Sans | Body text, labels, general UI |
| Poppins | Secondary/accent text (less common) |

Fonts are loaded in `providers/FontProvider.tsx`. Do not render any `<Text>` before `FontProvider` signals fonts are ready.

### Key Reusable Components

| Component | Path | Description |
|---|---|---|
| `Text` | `components/ui/Text.tsx` | Custom text with font control |
| `Button` | `components/ui/Button.tsx` | Variants: solid/outline, sizes: sm/md/lg, loading state |
| `PrimaryButton` | `components/ui/PrimaryButton.tsx` | Pre-styled primary CTA |
| `AmountInput` | `components/ui/AmountInput.tsx` | Currency amount input |
| `TextInputField` | `components/ui/TextInputField.tsx` | Text input with label |
| `DatePickerField` | `components/ui/DatePickerField.tsx` | Date picker with label |
| `CategorySelector` | `components/ui/CategorySelector.tsx` | Animated grid category picker |
| `SlideUpModal` | `components/ui/SlideUpModal.tsx` | Bottom sheet modal |
| `CircularProgress` | `components/ui/CircularProgress.tsx` | Progress ring |
| `CollapsibleCard` | `components/ui/CollapsibleCard.tsx` | Expandable card |
| `FeatureGateModal` | `components/ui/FeatureGateModal.tsx` | "Not available yet" modal |
| `MainContainer` | `components/layouts/MainContainer.tsx` | Screen wrapper (SafeArea + padding) |
| `OfflineNotice` | `components/offline/OfflineNotice.tsx` | Top banner when offline |

---

## 8. Key Directories & Responsibilities

| Directory | What belongs here |
|---|---|
| `app/` | Route files only — thin wrappers that import from `screens/` |
| `screens/` | Full screen component implementations |
| `components/ui/` | Generic, reusable, domain-agnostic UI primitives |
| `components/{domain}/` | Components specific to one feature area |
| `contexts/` | React Context providers + their hooks |
| `hooks/` | Custom hooks that aren't tied to a single context |
| `providers/` | Non-context providers (fonts, toast config) |
| `features/{domain}/` | Domain types, pure utils, domain-specific hooks |
| `src/api/hooks/` | TanStack Query hooks (one file per domain) |
| `src/api/client.ts` | Axios setup — do not modify unless changing auth flow |
| `src/api/endpoints.ts` | All API endpoint configs — add new endpoints here |
| `src/api/types.ts` | All API request/response TypeScript types |
| `lib/` | Pure utilities and non-React singleton setup |
| `constants/` | App-wide constant values (colors, keys, setup steps, etc.) |
| `navigation/` | `RootNavigator` only — auth guard logic |
| `assets/` | Static assets (fonts, icons, images, sounds) |

---

## 9. Development Guidelines

### Adding a New API Endpoint

1. Add endpoint definition to `src/api/endpoints.ts`
2. Add request/response types to `src/api/types.ts`
3. Create query/mutation hook in the relevant `src/api/hooks/use{Domain}Api.ts`
4. Export the hook from `src/api/hooks/index.ts`
5. Use in screens via the hook (never call `apiRequest` directly from a component)

### Validating API Types (Live Probe)

When endpoints or response shapes change on the backend, run the API probe script to detect mismatches before updating the frontend types:

1. The script lives at `scripts/api-probe.js`
2. It hits a configured Postman collection against the live backend
3. It outputs full responses to `docs/api-captures/zorah-api-responses.json`
4. Use this output as the source of truth for updating `src/api/endpoints.ts` and `src/api/types.ts`

To run it:
```bash
node scripts/api-probe.js
```

### Adding a New Screen

1. Create the screen component in `screens/NewScreen.tsx`
2. Create the route file in `app/(app)/new-screen.tsx` that imports and renders the screen
3. Add a `Stack.Screen` entry in `app/(app)/_layout.tsx` with `name="new-screen"` and any header options
4. Navigate with `router.push("/(app)/new-screen")`

### Naming Conventions

- Files: PascalCase for components (`HomeScreen.tsx`), camelCase for utilities (`persistedStorageConfig.ts`)
- Hooks: always prefix with `use` (`useSession`, `useAddExpenseMutation`)
- Query keys: tuple of strings, domain first — `['expenses', 'list']`, `['budget', 'detail', id]`
- Context hooks: named `use{Context}` — `useSession()`, `useAppSettings()`, `useNetworkStatus()`
- Constants: SCREAMING_SNAKE_CASE for string keys (`TOKEN_KEY`, `REFRESH_TOKEN_KEY`)
- Tailwind class merging: always use `cn()` from `lib/utils.ts`, not string concatenation

### Do's

- Use `useSession()` to access auth state — never `useContext(AuthContext)` directly
- Store tokens only in SecureStore via `persistedStorageConfig.ts` helpers
- Invalidate relevant query keys after mutations using `queryClient.invalidateQueries()`
- Use the custom `<Text>` component for all text rendering
- Use `MainContainer` as the wrapper for new screens (handles SafeArea + standard padding)
- Handle `isLoading` and `error` states from every query
- Use `handleApiError()` when catching errors outside React Query hooks

### Don'ts

- Do not call `AsyncStorage` directly in components — use context hooks or `lib/persistedStorageConfig.ts`
- Do not store auth tokens in AsyncStorage (use SecureStore)
- Do not import from `src/api/hooks/use{Domain}Api.ts` directly — import from `src/api/hooks/index.ts`
- Do not use React Native's `<Text>` — always use `components/ui/Text.tsx`
- Do not add logic to `app/` route files — they are thin wrappers
- Do not call `router.replace("/(auth)/signIn")` to log out — call `signOut()` from `useSession()`
- Do not bump `buster: "v1"` in `lib/reactQuery.ts` without knowing it will wipe all cached queries for all users on next launch

---

## 10. Known Issues & Technical Debt

### Active Known Issues (from `notes.md`)

1. **Wallet transactions API** returns `{ success: true, transactions: [] }` — empty array is a backend bug, not a frontend issue. Handle empty state gracefully in UI.
2. **Update Profile API** (`/auth/update-profile`) is not yet documented in Postman and may be incomplete on the backend.
3. **Smart Budgeting feature** — backend API not created yet. UI may exist but is not functional.
4. **Bill Reminders** — flagged for a full revamp. Current implementation is basic.

### Technical Debt

- **No test suite** — zero unit, integration, or E2E tests. Any refactor has no safety net.
- **Booleans stored as strings in AsyncStorage** — `"true"` / `"false"` comparisons are fragile. A future migration should use numeric or proper boolean encoding.
- **`userData` is JSON.stringify'd before AsyncStorage and parsed on every read** — risk of silent parse failures. The try/catch in `SessionProvider` silently sets `parsedUserData = null`.
- **Module-level mutable state in `client.ts`** (`isRefreshing`, `failedQueue`, `onTokenRefreshFailure`) — functional in RN's single thread but untestable and could be surprising if the module ever reloads.
- **No error boundaries** — an uncaught render error in any screen will crash the whole app with no recovery UI.
- **No analytics/logging** — zero crash reporting (Sentry, Bugsnag, etc.) or user analytics instrumentation.
- **No deep link handling configured** — `app.json` has no `scheme` or deep link config beyond basic Expo Router defaults.
- **Setup flow step tracking** is stored as a number but cast with `Number(setupStepRaw)` — if `setupStepRaw` is `null`, `Number(null)` returns `0`, which could misidentify the setup step.

---

## 11. Setup & Running the Project

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- iOS: Xcode 15+ with simulator
- Android: Android Studio with emulator
- EAS CLI for building: `npm install -g eas-cli`

### Install

```bash
cd pocketMonie
npm install
```

### Firebase Config (required for push notifications)

Place these files before running natively:
- `google-services.json` → project root (Android)
- `GoogleService-Info.plist` → project root (iOS)

These are gitignored. Get them from the Firebase console project `com.onerendzina.zorah`.

### Run

```bash
npx expo start          # Start Metro bundler
npx expo run:ios        # Run on iOS simulator (requires build)
npx expo run:android    # Run on Android emulator (requires build)
npm run web             # Run in browser
npm run lint            # ESLint
```

### Environment

No `.env` file found — the API base URL `https://getzorah.com/api` is hardcoded in `src/config/api.ts`. To point at a staging environment, change `API_CONFIG.baseURL` in that file.

### Common Issues

- **Fonts not loading:** Ensure `assets/fonts/` contains all font files. Check `providers/FontProvider.tsx` for the exact file names.
- **Push notifications not working in simulator:** FCM requires a real device for delivery. Expo Go also has limitations — use a development build.
- **White screen on launch:** Usually a provider crash (often Firebase config missing). Check Metro logs.
- **`useSession()` returns null:** Called outside `SessionProvider`. Check the provider tree in `app/_layout.tsx`.
- **Query cache stale from a previous dev session:** Increment `buster` in `lib/reactQuery.ts` to wipe it, or clear AsyncStorage manually.

---

## 12. Refactor Roadmap (Condensed)

### Quick Wins (low effort, high value)

1. **Add Sentry** (or similar) for crash reporting and error monitoring
2. **Fix `Number(setupStepRaw)` bug** — use explicit null check before converting
3. **Add error boundaries** around tab screens to prevent full-app crashes
4. **Create `src/api/hooks/index.ts` re-exports** if not complete — ensure all hooks are accessible from one import path

### Medium Effort

5. **Write integration tests** for `SessionProvider`, token refresh flow, and critical API hooks
6. **Migrate AsyncStorage boolean values** from `"true"`/`"false"` strings to `"1"`/`"0"` or use a typed wrapper
7. **Extract API base URL to environment config** — hardcoded URL prevents staging/prod switching without code changes
8. **Add deep link scheme** to `app.json` for notification tap navigation
9. **Implement Bill Reminders revamp** (flagged in notes)
10. **Complete Update Profile API integration** once backend is ready

### Major Architectural Changes

11. **Add E2E testing** with Maestro or Detox — critical before any production scaling
12. **Formalize feature flag system** — smart budgeting and other incomplete features need a proper gate, not dead code
13. **Consolidate contexts** — 5 separate React Contexts with AsyncStorage persistence could be unified into a single `useAppState` store (consider Zustand for a simpler model)
14. **Add analytics layer** — user behavior tracking is completely absent; no data to make product decisions

---

## 13. AI Agent Instructions

### General Rules

- **Never modify `src/api/client.ts`** unless explicitly asked to change auth/token behavior. The refresh queue logic is delicate.
- **Never modify `lib/reactQuery.ts`** unless explicitly asked. Changing `buster` wipes user caches on next launch.
- **Never modify `app/_layout.tsx` provider order** — the nesting order is load-bearing (SessionProvider needs QueryClient to exist).
- **Never call `signOut()` or `router.replace("/(auth)/signIn")` in a utility function** — these belong only in user-triggered handlers or the token refresh failure callback.

### When Adding Features

- New screens go in `screens/` + a thin wrapper in `app/`
- New API interactions go in `src/api/hooks/use{Domain}Api.ts` as React Query hooks
- New domain logic goes in `features/{domain}/`
- New reusable UI components go in `components/ui/`
- New constants go in `constants/` in the appropriate file

### When Modifying Existing Code

- Before changing any query key, grep for all usages — `queryClient.invalidateQueries` calls are scattered across screens
- Before modifying `SessionProvider`, trace every field through `useStorageState` / `useAsyncStorageState` — state is lazy-loaded and `isLoading` guards the entire auth guard
- Before changing the color system in `constants/colors.ts`, verify the Tailwind config in `tailwind.config.js` mirrors the changes
- Before touching navigation structure in `app/(app)/(home)/_layout.tsx`, test all 4 tabs and any hidden routes

### Areas Requiring Caution

| Area | Risk |
|---|---|
| `src/api/client.ts` | Token refresh logic — easy to introduce infinite loops or dropped queued requests |
| `contexts/auth-context/SessionProvider.tsx` | Auth state corruption can lock users out of the app |
| `lib/reactQuery.ts` | Changing `buster` wipes all user caches globally |
| `navigation/RootNavigator.tsx` | `Stack.Protected` logic — wrong guard breaks auth redirect |
| `app/(app)/(home)/_layout.tsx` | Tab bar customization — easy to break navigation for all main screens |
| AsyncStorage boolean flags | Always set as strings; always read with `=== "true"` |

### Code Style to Follow

- TypeScript strict mode — no `any`, no unchecked type assertions without a comment
- No default exports except for screen/layout components (Expo Router requirement for layouts)
- Extract magic strings to `constants/`
- No inline styles when a Tailwind class covers it — use `cn()` for conditional classes
- Keep screen components focused — extract sub-components when a screen file exceeds ~250 lines

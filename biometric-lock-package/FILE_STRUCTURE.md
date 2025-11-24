# Biometric Lock Package File Structure

This document shows the recommended file structure for the extracted biometric lock package.

## 📁 Recommended Structure

```
your-project/
├── components/
│   └── biometric-lock/
│       ├── LockScreen.tsx              # Main lock screen component
│       ├── PinSetupScreen.tsx          # PIN creation/confirmation screen
│       ├── UserInactivityProvider.tsx  # App state monitoring provider
│       └── useDeviceBiometricSupport.ts # Biometric support hook
│
├── hooks/
│   └── useBiometricApi.ts              # API hooks (adapt from example)
│
├── contexts/
│   └── SettingsContext.tsx             # Settings provider (create/adapt)
│
├── constants/
│   └── colors.ts                       # Color constants (adapt)
│
└── navigation/
    └── BiometricStack.tsx              # Navigation routes (if using React Navigation)
    # OR
    └── app/
        └── biometrics/
            ├── lock.tsx                # Lock screen route (if using Expo Router)
            └── overlay.tsx             # Overlay route (optional)
```

## 📝 File Descriptions

### Core Components

#### `LockScreen.tsx`
- Main lock screen with PIN entry
- Biometric authentication button
- Handles PIN verification
- Prevents navigation until unlocked

**Dependencies:**
- `useAppSettings` hook
- `useVerifyUserPinMutation` hook
- `useDeviceBiometricSupport` hook
- Navigation router
- Toast notifications

#### `PinSetupScreen.tsx`
- Two-step PIN creation (create → confirm)
- PIN validation
- Calls API to set PIN
- Enables biometrics after PIN setup

**Dependencies:**
- `useAppSettings` hook
- `useSetUserPinMutation` hook
- `useToggleBiometricsMutation` hook
- Navigation router
- Toast notifications

#### `UserInactivityProvider.tsx`
- Monitors app state (background/foreground)
- Automatically navigates to lock screen
- Manages background state flag

**Dependencies:**
- `useAppSettings` hook
- Navigation router
- AsyncStorage

#### `useDeviceBiometricSupport.ts`
- Checks device biometric capabilities
- Returns support information
- Platform-agnostic

**Dependencies:**
- `expo-local-authentication`

### Supporting Files

#### `useBiometricApi.ts`
- API hooks for PIN and biometric operations
- Adapt to your API client

#### `SettingsContext.tsx`
- Provides settings context
- Manages `enableBiometrics` state
- Can be adapted from existing settings

## 🔗 Integration Points

### 1. Settings Provider
```tsx
// Must provide:
interface Settings {
  enableBiometrics: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: string, value: boolean) => void;
}
```

### 2. Navigation Routes
Update these route strings in components:
- Home route: `"/(app)/(home)"` → your home route
- Lock route: `"/(app)/biometrics/lock"` → your lock route
- Overlay route: `"/(app)/biometrics/overlay"` → your overlay route

### 3. API Endpoints
Required endpoints:
- `POST /auth/verify-pin`
- `POST /auth/set-pin`
- `POST /auth/toggle-biometrics`

### 4. Constants
- `COLORS` - Color constants
- App icon path

## 📦 Dependencies Tree

```
biometric-lock/
├── expo-local-authentication
├── expo-haptics
├── react-native-reanimated
├── @react-native-async-storage/async-storage
├── react-native-toast-message
├── expo-image
├── expo-linear-gradient
├── react-native-safe-area-context
├── @expo/vector-icons
└── @tanstack/react-query (for API hooks)
```

## 🔄 Data Flow

```
UserInactivityProvider
    ↓ (detects background)
    ↓ (navigates to lock)
LockScreen
    ↓ (user enters PIN)
    ↓ (calls API)
useVerifyUserPinMutation
    ↓ (success)
    ↓ (navigates to home)
Home Screen
```

## 🎯 Key Integration Points

1. **Settings Context**: Must provide `enableBiometrics` boolean
2. **Navigation**: Must support route replacement/navigation
3. **API Client**: Must adapt hooks to your API structure
4. **Storage**: Uses AsyncStorage for background state flag
5. **Toast**: Uses react-native-toast-message for notifications

## 📱 Platform Files

### Android
- `android/app/src/main/AndroidManifest.xml` - Add `USE_BIOMETRIC` permission

### iOS
- `ios/YourApp/Info.plist` - Add `NSFaceIDUsageDescription`

## 🚀 Quick Integration

1. Copy files to your project
2. Install dependencies
3. Create/adapt Settings Provider
4. Adapt API hooks
5. Update navigation routes
6. Wrap app with providers
7. Test!

See `BIOMETRIC_LOCK_EXTRACTION_GUIDE.md` for detailed instructions.








# Biometric Lock Code Extraction Guide

This guide explains how to extract the biometric lock functionality from this codebase into another React Native/Expo project.

## 📦 Components to Extract

### Core Components
1. **LockScreen** (`screens/LockScreen.tsx`) - Main lock screen with PIN entry and biometric authentication
2. **UserInactivityProvider** (`contexts/user-inactivity/UserInactivityProvider.tsx`) - Handles app state changes and auto-locking
3. **PinSetupScreen** (`app/(app)/settings/pin.tsx`) - PIN creation/confirmation screen
4. **useDeviceBiometricSupport** hook (inside `LockScreen.tsx`) - Checks device biometric capabilities

### Supporting Files
- Navigation routes: `app/(app)/biometrics/lock.tsx`, `app/(app)/biometrics/overlay.tsx`
- API hooks: `useVerifyUserPinMutation`, `useSetUserPinMutation`, `useToggleBiometricsMutation`

## 📋 Required Dependencies

```json
{
  "dependencies": {
    "expo-local-authentication": "~17.0.7",
    "expo-haptics": "~15.0.7",
    "react-native-reanimated": "~4.1.1",
    "@react-native-async-storage/async-storage": "2.2.0",
    "react-native-toast-message": "^2.3.3",
    "expo-image": "~3.0.8",
    "expo-linear-gradient": "~15.0.7",
    "react-native-safe-area-context": "~5.6.0",
    "@expo/vector-icons": "^15.0.2",
    "expo-router": "~6.0.10" // or your navigation library
  }
}
```

## 🔧 Setup Instructions

### Step 1: Copy Core Files

Copy these files to your new project:

```
your-project/
├── components/
│   └── biometric-lock/
│       ├── LockScreen.tsx
│       ├── PinSetupScreen.tsx
│       ├── UserInactivityProvider.tsx
│       └── useDeviceBiometricSupport.ts
```

### Step 2: Adapt Dependencies

#### A. Settings Context Interface

The lock screen uses `useAppSettings()` to check if biometrics are enabled. You need to provide one of:

**Option 1: Create a Settings Provider** (if you don't have one)
```typescript
// contexts/SettingsContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
  enableBiometrics: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    enableBiometrics: false,
  });

  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used inside SettingsProvider');
  return ctx;
}
```

**Option 2: Use Props Instead** (simpler, less flexible)
Modify `LockScreen` to accept `enableBiometrics` as a prop instead of using context.

#### B. API Hooks

The lock screen uses these API hooks. Adapt them to your API structure:

```typescript
// hooks/useBiometricApi.ts
import { useMutation } from '@tanstack/react-query';

// Adapt these to your API client
export const useVerifyUserPinMutation = (options?: any) => {
  return useMutation({
    mutationKey: ['auth', 'verifyPin'],
    mutationFn: async (payload: { pin: string }) => {
      // Replace with your API call
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    ...options,
  });
};

export const useSetUserPinMutation = (options?: any) => {
  return useMutation({
    mutationKey: ['auth', 'setPin'],
    mutationFn: async (payload: { pin: string }) => {
      // Replace with your API call
      const response = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    ...options,
  });
};

export const useToggleBiometricsMutation = (options?: any) => {
  return useMutation({
    mutationKey: ['auth', 'toggleBiometrics'],
    mutationFn: async (payload: { enabled: boolean }) => {
      // Replace with your API call
      const response = await fetch('/api/auth/toggle-biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    ...options,
  });
};
```

#### C. Navigation

**For Expo Router:**
```typescript
// app/biometrics/lock.tsx
import LockScreen from '@/components/biometric-lock/LockScreen';

export default function LockRoute() {
  return <LockScreen />;
}
```

**For React Navigation:**
```typescript
// navigation/BiometricStack.tsx
import { createStackNavigator } from '@react-navigation/stack';
import LockScreen from '@/components/biometric-lock/LockScreen';

const Stack = createStackNavigator();

export function BiometricStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Lock" component={LockScreen} />
    </Stack.Navigator>
  );
}
```

#### D. Colors/Constants

Replace `COLORS` import with your color constants or inline values:

```typescript
// constants/colors.ts
export const COLORS = {
  primary_400: '#1A43BE',
  primary_200: '#EAEFFF',
  primary_100: '#F6FAFF',
  textColor: '#2A3A50',
  grey: '#D9D9D9',
};
```

#### E. App Icon

Replace the app icon path in `LockScreen.tsx`:
```typescript
// Change this line:
source={require("@/assets/images/icon.png")}

// To your icon path:
source={require("@/assets/icon.png")}
```

### Step 3: Integrate UserInactivityProvider

Wrap your app with `UserInactivityProvider`:

```typescript
// App.tsx or _layout.tsx
import { UserInactivityProvider } from '@/components/biometric-lock/UserInactivityProvider';

export default function App() {
  return (
    <SettingsProvider>
      <UserInactivityProvider>
        {/* Your app content */}
      </UserInactivityProvider>
    </SettingsProvider>
  );
}
```

**Important:** Update navigation routes in `UserInactivityProvider.tsx`:
- Change `"/(app)/biometrics/lock"` to your lock screen route
- Change `"/(app)/biometrics/overlay"` to your overlay route (optional)
- Change `"/(app)/(home)"` to your home route

### Step 4: Update Navigation Routes

In `LockScreen.tsx` and `UserInactivityProvider.tsx`, update all navigation routes:

```typescript
// Replace these:
router.replace("/(app)/(home)");
router.replace("/(app)/biometrics/lock");

// With your routes:
router.replace("/home");
router.replace("/lock");
```

### Step 5: Configure AsyncStorage Key

The `UserInactivityProvider` uses this key:
```typescript
const LAST_BACKGROUND_KEY = "userInactivity:wasInBackground";
```

You can change it if needed, but make sure it's consistent across your app.

## 🎨 Customization Options

### Styling
- Modify `styles` object in `LockScreen.tsx` and `PinSetupScreen.tsx`
- Change gradient colors in `LinearGradient` component
- Adjust PIN dot size, keypad button size, etc.

### Behavior
- **Lock Time**: Currently locks immediately. To add delay, modify `UserInactivityProvider.tsx`
- **PIN Length**: Change `CODE_FIELDS` constant (default: 4)
- **Auto-biometric**: Remove the `useEffect` that auto-triggers biometric in `LockScreen.tsx` if you don't want it

### Text/Labels
- Update greeting text: "Welcome back"
- Update subtitle: "Enter your PIN to continue"
- Update error messages in mutation `onError` handlers

## 🔐 API Endpoints Required

Your backend needs these endpoints:

1. **POST `/auth/verify-pin`**
   ```json
   { "pin": "1234" }
   ```

2. **POST `/auth/set-pin`**
   ```json
   { "pin": "1234" }
   ```

3. **POST `/auth/toggle-biometrics`**
   ```json
   { "enabled": true }
   ```

## 📱 Platform-Specific Notes

### Android
- Requires `USE_BIOMETRIC` permission in `AndroidManifest.xml`
- Fingerprint icon is shown by default on Android

### iOS
- Requires `NSFaceIDUsageDescription` in `Info.plist`
- Face ID icon shown if Face ID is available

## 🧪 Testing

1. **Test PIN Setup**: Navigate to PIN setup screen and create a PIN
2. **Test Lock Screen**: Put app in background and return - should show lock screen
3. **Test PIN Entry**: Enter correct/incorrect PIN
4. **Test Biometric**: Enable biometrics and test fingerprint/face ID
5. **Test Navigation**: Ensure lock screen prevents navigation until unlocked

## 🐛 Common Issues

### Issue: "useAppSettings must be used inside SettingsProvider"
**Solution**: Wrap your app with `SettingsProvider`

### Issue: Navigation not working
**Solution**: Update all route strings in `LockScreen.tsx` and `UserInactivityProvider.tsx`

### Issue: Biometric not working
**Solution**: 
- Check device has biometric hardware
- Ensure permissions are set in `AndroidManifest.xml` / `Info.plist`
- Verify `expo-local-authentication` is properly installed

### Issue: API calls failing
**Solution**: Adapt API hooks to match your API client structure and endpoints

## 📝 Summary Checklist

- [ ] Copy core component files
- [ ] Install all required dependencies
- [ ] Create/adapt Settings Provider
- [ ] Adapt API hooks to your backend
- [ ] Update navigation routes
- [ ] Replace color constants
- [ ] Update app icon path
- [ ] Wrap app with `UserInactivityProvider`
- [ ] Test PIN setup flow
- [ ] Test lock screen functionality
- [ ] Test biometric authentication
- [ ] Customize styling/text as needed

## 📚 Additional Resources

- [Expo Local Authentication Docs](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Note**: This extraction maintains the core functionality but may require adjustments based on your project structure, navigation library, and API setup.








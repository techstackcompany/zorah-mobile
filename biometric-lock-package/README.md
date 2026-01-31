# Biometric Lock Package

A reusable React Native biometric lock screen component with PIN authentication and app inactivity detection.

## Features

- 🔒 PIN-based authentication (4-digit)
- 👆 Biometric authentication (Face ID / Fingerprint)
- ⏱️ Automatic app locking on background/inactivity
- 🎨 Beautiful, customizable UI
- 📱 Cross-platform (iOS & Android)
- ⚡ Smooth animations with Reanimated
- 🎯 TypeScript support

## Installation

```bash
npm install expo-local-authentication expo-haptics react-native-reanimated @react-native-async-storage/async-storage react-native-toast-message expo-image expo-linear-gradient react-native-safe-area-context @expo/vector-icons
```

## Quick Start

### 1. Copy Components

Copy the `components/biometric-lock/` folder to your project.

### 2. Setup Provider

```tsx
import { UserInactivityProvider } from './components/biometric-lock/UserInactivityProvider';
import { SettingsProvider } from './contexts/SettingsProvider';

export default function App() {
  return (
    <SettingsProvider>
      <UserInactivityProvider>
        {/* Your app */}
      </UserInactivityProvider>
    </SettingsProvider>
  );
}
```

### 3. Add Routes

```tsx
// For Expo Router
// app/biometrics/lock.tsx
import LockScreen from '@/components/biometric-lock/LockScreen';
export default LockScreen;
```

### 4. Configure API Hooks

Adapt the API hooks in `hooks/useBiometricApi.ts` to match your backend.

## API Requirements

Your backend should provide:

- `POST /auth/verify-pin` - Verify user PIN
- `POST /auth/set-pin` - Set user PIN
- `POST /auth/toggle-biometrics` - Enable/disable biometrics

## Customization

See `BIOMETRIC_LOCK_EXTRACTION_GUIDE.md` for detailed customization options.









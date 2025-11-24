# Biometric Lock Extraction Checklist

Use this checklist when extracting the biometric lock code to another project.

## 📋 Pre-Extraction

- [ ] Review `BIOMETRIC_LOCK_EXTRACTION_GUIDE.md` for full instructions
- [ ] Identify your navigation library (Expo Router, React Navigation, etc.)
- [ ] Identify your API client structure
- [ ] Check if you have a settings/context provider

## 📦 Files to Copy

### Core Components
- [ ] `screens/LockScreen.tsx` → `components/biometric-lock/LockScreen.tsx`
- [ ] `app/(app)/settings/pin.tsx` → `components/biometric-lock/PinSetupScreen.tsx`
- [ ] `contexts/user-inactivity/UserInactivityProvider.tsx` → `components/biometric-lock/UserInactivityProvider.tsx`
- [ ] Extract `useDeviceBiometricSupport` hook → `components/biometric-lock/useDeviceBiometricSupport.ts`

### Supporting Files
- [ ] Create navigation routes for lock screen
- [ ] Create API hooks (use `hooks/useBiometricApi.ts.example` as template)

## 🔧 Configuration

### Dependencies
- [ ] Install `expo-local-authentication`
- [ ] Install `expo-haptics`
- [ ] Install `react-native-reanimated`
- [ ] Install `@react-native-async-storage/async-storage`
- [ ] Install `react-native-toast-message`
- [ ] Install `expo-image`
- [ ] Install `expo-linear-gradient`
- [ ] Install `react-native-safe-area-context`
- [ ] Install `@expo/vector-icons`

### Settings Provider
- [ ] Create `SettingsProvider` (or adapt existing)
- [ ] Ensure `enableBiometrics` setting exists
- [ ] Ensure `updateSetting` function works

### API Integration
- [ ] Adapt `useVerifyUserPinMutation` to your API
- [ ] Adapt `useSetUserPinMutation` to your API
- [ ] Adapt `useToggleBiometricsMutation` to your API
- [ ] Test API endpoints are working

### Navigation
- [ ] Update routes in `LockScreen.tsx`:
  - [ ] Replace `"/(app)/(home)"` with your home route
- [ ] Update routes in `UserInactivityProvider.tsx`:
  - [ ] Replace `"/(app)/biometrics/lock"` with your lock route
  - [ ] Replace `"/(app)/biometrics/overlay"` with your overlay route (optional)
  - [ ] Replace `"/(app)/(home)"` with your home route
- [ ] Update routes in `PinSetupScreen.tsx`:
  - [ ] Replace `"/(app)/(home)/profile"` with your profile route
  - [ ] Replace `"/(app)/(home)"` with your home route

### Constants & Assets
- [ ] Replace `COLORS` import with your color constants
- [ ] Update app icon path in `LockScreen.tsx`
- [ ] Update app icon path in `PinSetupScreen.tsx`

### Integration
- [ ] Wrap app with `SettingsProvider`
- [ ] Wrap app with `UserInactivityProvider`
- [ ] Add lock screen route to navigation

## 🧪 Testing

### Functionality Tests
- [ ] PIN setup flow works
- [ ] PIN verification works
- [ ] Biometric authentication works
- [ ] App locks when going to background
- [ ] App shows lock screen when returning from background
- [ ] Lock screen prevents navigation until unlocked
- [ ] Error handling works (wrong PIN, etc.)

### Platform Tests
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Test Face ID on iOS
- [ ] Test Fingerprint on Android
- [ ] Test without biometric hardware (should show PIN only)

### Edge Cases
- [ ] Test with biometrics disabled
- [ ] Test with no PIN set
- [ ] Test rapid app switching
- [ ] Test network errors during API calls

## 🎨 Customization (Optional)

- [ ] Customize colors/styling
- [ ] Customize text/labels
- [ ] Adjust PIN length (if needed)
- [ ] Customize lock delay (if needed)
- [ ] Add custom animations

## 📱 Platform Configuration

### Android
- [ ] Add `USE_BIOMETRIC` permission to `AndroidManifest.xml`
- [ ] Test on Android device

### iOS
- [ ] Add `NSFaceIDUsageDescription` to `Info.plist`
- [ ] Test on iOS device

## ✅ Final Checks

- [ ] All TypeScript errors resolved
- [ ] All linter warnings addressed
- [ ] Code follows your project's style guide
- [ ] Documentation updated (if needed)
- [ ] Team members informed of new dependencies

## 🐛 Troubleshooting

If you encounter issues, check:
- [ ] All dependencies are installed correctly
- [ ] Settings provider is properly set up
- [ ] API hooks are correctly adapted
- [ ] Navigation routes are correct
- [ ] Platform permissions are set
- [ ] Console for error messages

---

**Note**: This is a comprehensive checklist. Some items may not apply to your specific project structure.








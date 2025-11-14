# Push Notifications Setup for Dev Build

## Why it worked in Expo Go but not in Dev Build

Expo Go has Firebase pre-configured, but dev builds require you to set up Firebase Cloud Messaging (FCM) credentials yourself.

## Steps to Set Up FCM for Android

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Add Android App to Firebase

1. In Firebase Console, click the Android icon to add an Android app
2. Enter your package name: `com.onerendzina.zorah`
3. Download the `google-services.json` file (you'll need this later)

### 3. Create a Service Account Key

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file (this is your FCM server key)

### 4. Configure FCM Credentials in EAS

Run this command in your terminal:

```bash
eas credentials
```

Then:

1. Select **Android**
2. Select your project
3. Choose **Push Notifications (FCM Server Key)**
4. Select **Set up new FCM Server Key**
5. Paste your FCM Server Key from the service account JSON file

**To get the FCM Server Key:**

- Open the service account JSON file you downloaded
- Look for the `private_key` field (you'll need the full key)
- Or use the Firebase Console → Project Settings → Cloud Messaging → Server Key

### 5. Rebuild Your Dev Build

After configuring credentials, rebuild your app:

```bash
eas build --profile development --platform android
```

Or if building locally:

```bash
npx expo run:android
```

### 6. Test Push Notifications

After installing the new build:

1. Open your app
2. Check the console logs for "Push token registered successfully"
3. Use the [Expo Push Notification Tool](https://expo.dev/notifications) to send a test notification

## Alternative: Quick Setup via EAS CLI

You can also use the interactive setup:

```bash
eas build:configure
```

This will guide you through setting up push notifications.

## Troubleshooting

- **Still getting Firebase error?** Make sure you rebuilt the app after configuring credentials
- **Credentials not found?** Run `eas credentials` again and verify they're set
- **Wrong package name?** Ensure your `app.json` package name matches Firebase

## Resources

- [Expo Push Notifications Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [FCM Credentials Guide](https://docs.expo.dev/push-notifications/fcm-credentials/)


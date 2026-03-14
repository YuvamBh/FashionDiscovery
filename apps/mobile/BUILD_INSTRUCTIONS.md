# Building Development Client

## Prerequisites

- **iOS**: Xcode installed (Mac only)
- **Android**: Android Studio + Android SDK

## Local Build (Faster)

### Android

```bash
npx expo run:android
```

This builds and installs the dev client on a connected device/emulator.

### iOS (Mac only)

```bash
npx expo run:ios
```

## Cloud Build with EAS (No local setup needed)

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Build for Development

**Android APK:**

```bash
eas build --profile development --platform android
```

**iOS Simulator (Mac):**

```bash
eas build --profile development --platform ios
```

**Both:**

```bash
eas build --profile development --platform all
```

### 4. Install the Build

- Android: Download APK and install on device
- iOS: Download and drag to Xcode simulator

### 5. Start Dev Server

```bash
npx expo start --dev-client
```

Then scan QR with your custom dev client app.

## Quick Start (Recommended)

For Android on Windows, run:

```bash
npx expo run:android
```

This will build and launch the app with working gestures!

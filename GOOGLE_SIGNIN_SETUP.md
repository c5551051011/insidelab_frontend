# Google Sign-In Setup Instructions (Simplified Version)

Your app now uses Google Sign-In directly without Firebase, making setup much simpler!

## Prerequisites

1. **Google Cloud Console Account**: You need access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create Google Cloud Project

### 1.1 Create New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `insidelab-app`
4. Create the project

### 1.2 Enable Google Sign-In API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Sign-In"
3. Click on **Google Sign-In API**
4. Click **Enable**

## Step 2: Create OAuth Credentials

### 2.1 Create OAuth 2.0 Client IDs
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**

### 2.2 Android Client ID
1. **Application type**: Android
2. **Name**: `InsideLab Android`
3. **Package name**: `com.insidelab.app` (check `android/app/build.gradle`)
4. **SHA-1 certificate**: Get it by running:
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Copy the SHA1 from the debug keystore
5. Click **CREATE**

### 2.3 iOS Client ID  
1. **Application type**: iOS
2. **Name**: `InsideLab iOS`
3. **Bundle ID**: `com.insidelab.app` (check `ios/Runner/Info.plist`)
4. Click **CREATE**

### 2.4 Web Client ID (Optional)
1. **Application type**: Web application
2. **Name**: `InsideLab Web`
3. Click **CREATE**

## Step 3: iOS Configuration (Optional)

### 3.1 Configure iOS URL Schemes (if using iOS)
1. Open Xcode: `open ios/Runner.xcworkspace`
2. Select `Runner` → `Info` → `URL Types`
3. Add a new URL Type:
   - **Identifier**: `com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID`
   - **URL Schemes**: Your reversed iOS client ID

**Example:**
If your iOS client ID is: `123456789-abcdef.apps.googleusercontent.com`
Then URL scheme is: `com.googleusercontent.apps.123456789-abcdef`

## Step 4: Test the Setup

### 4.1 Run Flutter Dependencies
```bash
flutter pub get
flutter clean
```

### 4.2 Test on Device/Emulator
```bash
# Android
flutter run

# iOS (requires physical device for Google Sign-In)
flutter run
```

### 4.3 Verify Authentication
1. Launch the app
2. Go to Sign In screen
3. Tap "Continue with Google"
4. Complete Google authentication
5. Check if user is signed in successfully

## Common Issues & Solutions

### Android Issues
- **Sign-in fails**: Verify SHA-1 certificate matches the one in Google Cloud Console
- **Package name mismatch**: Check `android/app/build.gradle` applicationId matches OAuth client
- **Network error**: Check internet connection and Google Cloud project settings

### iOS Issues
- **Sign-in popup doesn't appear**: Verify URL schemes are correctly configured in Xcode
- **Invalid client error**: Check bundle ID matches the OAuth client
- **Simulator issues**: Google Sign-In requires physical iOS device for testing

### General Issues
- **Google Sign-In not working**: Verify OAuth client IDs are created correctly
- **Dependency conflicts**: Run `flutter clean` and `flutter pub get`

## Security Notes

1. **Restrict API keys in Google Cloud Console** for production
2. **Use different Google Cloud projects for development/production**
3. **Keep OAuth client secrets secure**

## Educational Email Verification

The app automatically detects educational emails (.edu, .ac.uk, etc.) and marks users as verified. Non-educational emails can still sign in but won't have full verification status.

## Next Steps

After Google Sign-In is working:
1. Set up user profile sync with your backend
2. Implement proper user role management  
3. Add analytics and crash reporting
4. Configure production Google Cloud environment

## Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Review Flutter and Google Sign-In documentation
3. Check Google Cloud Console for API quotas
4. Test on physical devices for iOS

---

**Important**: This simplified setup doesn't require Firebase configuration files!
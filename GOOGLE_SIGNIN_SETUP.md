# Google Sign-In Setup Guide

## Overview
To enable Google Sign-In for the InsideLab application, you need to configure Google Cloud Console and update the client IDs in your Flutter app.

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select a Project**:
   - Create a new project or select an existing one
   - Note your project ID

3. **Enable Google Sign-In API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" and enable it

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - App name: "InsideLab"
     - User support email: Your email
     - App domain: Your domain (if applicable)
     - Developer contact email: Your email

5. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "InsideLab Web Client"
   - Authorized origins: Add your domains:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Copy the generated Client ID

## Step 2: Update Flutter Configuration

### Web Configuration

1. **Update web/index.html**:
   ```html
   <!-- Replace YOUR_GOOGLE_CLIENT_ID with your actual Client ID -->
   <meta name="google-signin-client_id" content="123456789-abcdefg.apps.googleusercontent.com">
   ```

2. **Update lib/services/google_auth_service.dart**:
   ```dart
   // Replace with your actual Google Client ID
   static const String _webClientId = '123456789-abcdefg.apps.googleusercontent.com';
   ```

## Step 3: Test the Integration

1. **Start your Flutter web app**:
   ```bash
   flutter run -d chrome
   ```

2. **Try Google Sign-In**:
   - Go to sign-in or sign-up page
   - Click "Continue with Google"
   - Should open Google authentication flow

## Troubleshooting

### Common Issues:

1. **"ClientID not set" Error**:
   - Make sure both `web/index.html` and `google_auth_service.dart` have the correct Client ID
   - Client ID format: `numbers-letters.apps.googleusercontent.com`

2. **"origin_mismatch" Error**:
   - Add your domain to "Authorized JavaScript origins" in Google Cloud Console
   - For development: `http://127.0.0.1:PORT`
   - For production: `https://yourdomain.com`

## Current Status

✅ Google Sign-In configuration placeholders added
⚠️  **Action Required**: Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID

## Files Modified

- `web/index.html`: Added Google Sign-In meta tag
- `lib/services/google_auth_service.dart`: Added client ID configuration
- `lib/data/providers/data_providers.dart`: Added Google Sign-In backend integration

Once you complete the Google Cloud Console setup and update the Client IDs, Google Sign-In will work properly!
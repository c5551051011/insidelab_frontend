# Google Authentication Setup Guide

## Overview
This guide will help you configure Google Authentication for the InsideLab Flutter web application.

## Prerequisites
- Google Cloud Console access
- Flutter web development environment

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API

## Step 2: Configure OAuth 2.0 Credentials
1. In Google Cloud Console, navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Select **Web application** as the application type
4. Add your authorized JavaScript origins:
   - `http://localhost:8080` (for local development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:8080` (for local development)
   - `https://yourdomain.com` (for production)
6. Copy the **Client ID** (it should look like: `123456789-abcdefg.apps.googleusercontent.com`)

## Step 3: Configure Flutter Application

### 3.1 Update Google Auth Service
Replace the Client ID in `lib/services/google_auth_service.dart`:

```dart
// Replace this line:
static const String _webClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// With your actual Client ID:
static const String _webClientId = '123456789-abcdefg.apps.googleusercontent.com';
```

### 3.2 Update HTML Meta Tag
Update `web/index.html` and replace:

```html
<!-- Replace this line: -->
<meta name="google-signin-client_id" content="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">

<!-- With your actual Client ID: -->
<meta name="google-signin-client_id" content="123456789-abcdefg.apps.googleusercontent.com">
```

## Step 4: Backend Configuration
Make sure your backend API supports the `/auth/google/` endpoint that accepts:
```json
{
  "id_token": "google_id_token",
  "email": "user@example.com",
  "name": "User Name"
}
```

## Troubleshooting

### Error: "popup_closed"
This error occurs when:
1. **Browser blocks popups**: Allow popups for your domain
2. **User closes popup manually**: User needs to complete the sign-in process
3. **Client ID not configured**: Make sure you've replaced `YOUR_GOOGLE_CLIENT_ID`

**Solution**:
- Allow popups in browser settings
- Ensure Google Client ID is properly configured
- Try using a different browser or incognito mode

### Error: "400 Bad Request"
This usually means:
1. **Invalid Client ID**: Double-check your Client ID configuration
2. **Backend API issues**: Verify your backend `/auth/google/` endpoint
3. **Missing required fields**: Ensure `id_token`, `email`, and `name` are sent

**Solution**:
- Verify Client ID matches exactly between Google Cloud Console and your app
- Check backend logs for specific error details
- Ensure backend API expects the correct request format

### Error: "Google Client ID not configured"
This is a custom error from our app when `YOUR_GOOGLE_CLIENT_ID` hasn't been replaced.

**Solution**: Follow Step 3 above to configure your actual Google Client ID.

## Testing
1. Run your Flutter web app: `flutter run -d chrome`
2. Try the Google Sign-In button
3. Check browser console for any errors
4. Verify network requests in browser DevTools

## Security Notes
- Never commit your actual Client ID to public repositories
- Use environment variables for production deployments
- Consider using different Client IDs for development and production environments


```
📋 What You Need to Do:

1. Configure Google Client ID (Required):
   - Follow the setup guide in GOOGLE_AUTH_SETUP.md
   - Replace YOUR_GOOGLE_CLIENT_ID in both:
   - lib/services/google_auth_service.dart
   - web/index.html
2. Test the Fixes:
   - Run the app and try Google Sign-In
   - Check browser console for debug output
   - The logs will show exactly what's being sent to your backend

🔍 Root Causes Identified:

- popup_closed error: Browser popup blockers + deprecated sign-in methods
- 400 error: Likely unconfigured Google Client ID or backend API expecting different format

The debug logging will now show you exactly what data is being sent to your /auth/google/ endpoint, helping identify any
remaining backend compatibility issues.

```

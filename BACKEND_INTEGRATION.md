# Backend Integration Guide

## Overview
The InsideLab frontend has been updated to integrate with a REST API backend. This document outlines the expected API endpoints and data structures.

## API Configuration

**Base URL**: `http://127.0.0.1:8000/api/v1` (Update in `lib/services/api_service.dart`)

## Authentication Endpoints

### 1. Login
**POST** `/auth/login/`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "name": "Full Name",
    "is_verified": true,
    "is_lab_member": false,
    "university": "University Name",
    "department": "Department",
    "lab_name": "Lab Name",
    "position": "PhD Student",
    "created_at": "2024-01-01T00:00:00Z",
    "review_count": 5,
    "helpful_votes": 23
  }
}
```

### 2. Register
**POST** `/auth/register/`
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "First",
  "last_name": "Last"
}
```

### 3. Google Auth
**POST** `/auth/google/`
```json
{
  "id_token": "google_id_token",
  "email": "user@gmail.com",
  "name": "Full Name"
}
```

### 4. Get User Profile
**GET** `/auth/user/` (Requires Authentication)

### 5. Update Profile
**PUT** `/auth/profile/` (Requires Authentication)
```json
{
  "name": "Updated Name",
  "university": "New University",
  "department": "New Department",
  "position": "PostDoc"
}
```

## Authentication Flow

1. **Email/Password Login**: User enters credentials → API call → JWT token stored → User logged in
2. **Google Sign-In**: Google auth → Get Google token → Send to backend → Backend creates/updates user → JWT token stored → User logged in
3. **Auto-Login**: App checks for stored JWT token → Validates with backend → Auto-login if valid
4. **Token Persistence**: JWT tokens are stored in SharedPreferences for session persistence

## User Data Structure

The User model expects these fields from the backend:
- `id` (string/int)
- `email` (string)
- `name` or `username` (string)
- `is_verified` (boolean)
- `is_lab_member` (boolean)
- `university` (string, nullable)
- `department` (string, nullable)
- `lab_name` (string, nullable)
- `position` (string, nullable)
- `created_at` (ISO date string)
- `review_count` (int, default 0)
- `helpful_votes` (int, default 0)

## Error Handling

The frontend expects standard HTTP status codes:
- `200/201`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found
- `500`: Server Error

Error responses should include a message:
```json
{
  "error": "Invalid credentials",
  "detail": "The provided email or password is incorrect."
}
```

## Headers

**Authentication Required Endpoints**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Next Steps

1. **Backend Development**: Implement these endpoints in your backend
2. **URL Configuration**: Update `baseUrl` in `lib/services/api_service.dart`
3. **CORS Setup**: Ensure your backend allows requests from your frontend domain
4. **SSL/HTTPS**: Use HTTPS in production
5. **Token Refresh**: Implement refresh token logic for long-term sessions

## Testing

The authentication system includes:
- ✅ Email/password login with backend API
- ✅ User registration with backend API
- ✅ Google sign-in with backend sync
- ✅ Automatic authentication on app start
- ✅ Token persistence across sessions
- ✅ Profile updates with backend sync
- ✅ Proper error handling and user feedback
- ✅ Write review authentication check

## Security Notes

- JWT tokens are stored securely using SharedPreferences
- API calls use proper authorization headers
- Google sign-in tokens are validated server-side
- User sessions persist across app restarts
- Expired tokens are handled gracefully
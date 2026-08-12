# Authentication Setup Guide

## Overview

The EmergencyEcho application uses **n8n-backed authentication workflows** for signup, login, email verification, and password reset. The frontend submits credentials to Next.js API routes, which then forward the request to n8n. The app stores the resulting session data locally for the active browser session.

## Test User Accounts

You can use the following test accounts to log in to the application:

### Patient Account
- **Email**: `test@example.com`
- **Password**: `password123`
- **Role**: Patient

### Doctor Account
- **Email**: `doctor@example.com`
- **Password**: `password123`
- **Role**: Doctor

### Nurse Account
- **Email**: `nurse@example.com`
- **Password**: `password123`
- **Role**: Nurse

## How to Test Login

1. Navigate to the login page: `http://localhost:3000/login`
2. Enter one of the test email addresses above
3. Enter the password: `password123`
4. Click "Log in"
5. You should be redirected to the home page (`/app/home`)

## Authentication Flow

### Login Process

1. **Client** sends credentials to `/api/auth/login-n8n`
2. **API** validates credentials by calling the configured n8n login webhook
3. **n8n** returns the login payload for the user session
4. **API** forwards the response to the client
5. **Client** stores the active session for the browser session
6. **User** is authenticated and can access protected routes

### Error Handling

The login endpoint provides detailed error messages:

- **Invalid credentials**: "Invalid email or password. Please try again."
- **Unverified email**: "Please verify your email before logging in."
- **Rate limited**: "Too many login attempts. Please try again later."
- **Server errors**: "Login service error. Please try again later."

## API Endpoints

### POST /api/auth/login-n8n
Authenticate a user with email and password through the n8n login workflow.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "access_token": "eyJhbGciOiJFUzI1NiIs...",
  "refresh_token": "refreshtoken...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "email_confirmed_at": "2026-07-03T00:11:20Z",
    ...
  },
  "profile": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid email or password. Please try again.",
  "code": "INVALID_CREDENTIALS"
}
```

## Creating Additional Test Users

Create test users through the signup form or by posting to `/api/auth/signup-all-roles`. The backend then forwards the request to the configured n8n signup workflow.

## Environment Variables

The following environment variables are required for authentication:

- `N8N_SIGNUP_WEBHOOK_URL`: n8n signup workflow URL
- `N8N_LOGIN_WEBHOOK_URL`: n8n login workflow URL
- `N8N_EMAIL_WEBHOOK_URL`: n8n email verification workflow URL
- `N8N_PASSWORD_RESET_WEBHOOK_URL`: n8n password reset workflow URL

Other Supabase and app variables may still be used for profile, wallet, document, and session data features elsewhere in the app.

## Troubleshooting

### "Login service is temporarily unavailable"
This error indicates that the backend cannot reach the n8n login workflow. Check that:
1. Internet connection is available
2. The n8n webhook URL is correct and active
3. Environment variables are properly configured

### "Invalid email or password"
This error means either:
1. The user doesn't exist in the database
2. The password is incorrect
3. The user's email is not confirmed

### "Too many login attempts"
The login endpoint is rate-limited to prevent brute force attacks. Wait a few minutes before trying again.

## Security Notes

- Passwords are never stored or transmitted in plain text to the frontend
- Authentication requests are handled by n8n-backed workflows
- The frontend stores only the active browser session data needed for navigation
- All API requests are rate-limited to prevent abuse

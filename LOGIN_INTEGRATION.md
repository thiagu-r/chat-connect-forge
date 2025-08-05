# Login Integration

This document describes the login functionality that has been integrated into the WhatsApp CRM application.

## Features Implemented

### 1. Authentication API Service (`src/lib/api.ts`)
- Handles login requests to the API endpoint
- Manages access and refresh tokens
- Provides automatic token refresh functionality
- Includes logout functionality
- Supports authenticated API requests

### 2. Authentication Context (`src/contexts/AuthContext.tsx`)
- Manages authentication state across the application
- Provides login/logout functions
- Handles token storage in localStorage
- Checks authentication status on app load

### 3. Login Page (`src/pages/Login.tsx`)
- Beautiful login form with username and password fields
- Loading states and error handling
- Responsive design with proper styling
- Automatic redirect to dashboard after successful login

### 4. Protected Routes (`src/components/ProtectedRoute.tsx`)
- Wraps protected components to ensure authentication
- Redirects to login page if user is not authenticated
- Shows loading state while checking authentication

### 5. API Integration Hook (`src/hooks/useApi.ts`)
- Provides hooks for making authenticated API calls
- Integrates with React Query for caching and state management
- Supports both queries and mutations

## API Endpoints

### Login
- **URL**: `https://wp.dev-api.medyaan.com/api/login/`
- **Method**: POST
- **Payload**:
  ```json
  {
    "username": "karthik",
    "password": "Admin@123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": null
  }
  ```

### Token Refresh
- **URL**: `https://wp.dev-api.medyaan.com/api/token/refresh/`
- **Method**: POST
- **Payload**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

## Usage

### Login Flow
1. User navigates to `/login`
2. Enters username and password
3. Form submits to API
4. On success, tokens are stored and user is redirected to dashboard
5. On error, error message is displayed

### Protected Routes
- All routes except `/login` are protected
- Unauthenticated users are redirected to login
- Authenticated users can access the dashboard

### Making API Calls
```typescript
import { useApi } from '@/hooks/useApi';

const { useAuthenticatedQuery, useAuthenticatedMutation } = useApi();

// For GET requests
const { data, isLoading, error } = useAuthenticatedQuery(
  ['contacts'],
  '/contacts/'
);

// For POST/PUT/DELETE requests
const mutation = useAuthenticatedMutation(
  '/contacts/',
  'POST'
);
```

## Token Management

- **Access Token**: Used for API authentication, stored in localStorage
- **Refresh Token**: Used to get new access tokens when they expire
- **Automatic Refresh**: API service automatically refreshes tokens on 401 responses
- **Manual Refresh**: Available through `TokenUtils.forceRefreshToken()`
- **Token Validation**: Check expiration with `TokenUtils.isTokenExpired()`
- **Logout**: Clears all tokens and redirects to login

### Token Utilities

The application includes utility functions for token management:

```typescript
import { TokenUtils } from '@/lib/tokenUtils';

// Check if token is expired
const isExpired = TokenUtils.isTokenExpired(token);

// Get token expiration time
const expiration = TokenUtils.getTokenExpiration(token);

// Force refresh token
await TokenUtils.forceRefreshToken();

// Test token refresh functionality
await TokenUtils.testTokenRefresh();
```

## Security Features

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- Automatic token refresh on API failures
- Protected routes prevent unauthorized access
- Error handling for failed authentication

## Next Steps

1. **Add more API endpoints** for contacts, messages, templates, etc.
2. **Implement user profile management**
3. **Add password reset functionality**
4. **Enhance security** with httpOnly cookies
5. **Add session timeout handling**
6. **Implement remember me functionality**

## Testing

To test the login functionality:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. You'll be redirected to `/login` if not authenticated
4. Use the credentials:
   - Username: `karthik`
   - Password: `Admin@123`
5. After successful login, you'll be redirected to the dashboard
6. Use the logout button in the sidebar to log out 
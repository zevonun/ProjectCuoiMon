# JWT Token Expiration Fix - Summary

## Problem
The application was experiencing JWT token expiration errors when making POST requests to `/api/orders`:
```
❌ Token error: jwt expired
POST /api/orders 401 8.162 ms - 54
```

## Root Cause
The frontend order API files (`app/checkout/lib/orderApi.ts` and `app/orders/lib/orderApi.ts`) were using plain `fetch()` without automatic token refresh logic. When the JWT token expired during order creation, the request would fail with a 401 error instead of:
1. Detecting the token expiration
2. Using the refresh token to get a new access token
3. Retrying the request

## Solution Implemented

### 1. Created Centralized API Client for Frontend
**File**: `frontend/app/lib/apiClient.ts`

This new module provides:
- `apiFetch()` - Enhanced fetch wrapper with automatic token refresh
- `apiGet()`, `apiPost()`, `apiPatch()`, `apiDelete()` - Convenience helpers
- Automatic 401 error handling with token refresh
- Seamless request retry after successful token refresh

### 2. Updated Order API Files
Updated both order API files to use `apiFetch` instead of plain `fetch`:

**Files Updated**:
- `frontend/app/checkout/lib/orderApi.ts`
- `frontend/app/orders/lib/orderApi.ts`

**Changes**:
- Import `apiFetch` from `../../lib/apiClient`
- Replace all `fetch()` calls with `apiFetch()`
- Automatic token refresh now handles 401 responses

### 3. Created Backup API Client for Admin Frontend
**File**: `admin-frontend/lib/fetchWithAuth.ts`

Created `fetchWithAuth()` with the same token refresh logic as backup. The admin-frontend already has working token refresh in `lib/api.ts`, so this serves as additional safeguard.

## How It Works

When a request fails with 401:
1. Check if we haven't already retried (prevent infinite loops)
2. Attempt to refresh the access token using the refresh token
3. If refresh succeeds, retry the original request with new token
4. If refresh fails, clear tokens and redirect to login

## Code Flow Example

```typescript
// Before (failing):
const response = await fetch(`${API_URL}/api/orders`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${expiredToken}` },
  body: JSON.stringify(payload),
});
// Result: 401 Unauthorized ❌

// After (working):
const response = await apiFetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify(payload),
});
// If 401: automatically refreshes token and retries ✅
```

## Testing

To verify the fix works:
1. Create an order while having a valid token
2. Wait for the token to expire (default: 24 hours)
3. Try to create another order
4. The request should automatically refresh the token and succeed

## Console Logs for Debugging

When token refresh occurs, you'll see:
```
🔄 Token expired, attempting refresh...
📡 Refresh response status: 200
✅ Token refreshed, retrying request...
✅ New tokens saved to localStorage
```

If token refresh fails:
```
❌ Token refresh failed, redirecting to login...
```

## Files Modified
1. ✅ `frontend/app/lib/apiClient.ts` - **NEW**
2. ✅ `frontend/app/checkout/lib/orderApi.ts` - Updated
3. ✅ `frontend/app/orders/lib/orderApi.ts` - Updated
4. ✅ `admin-frontend/lib/fetchWithAuth.ts` - **NEW** (backup)

## Notes
- The refresh token endpoint `/api/users/refresh-token` must be available on the backend
- Backend already has this endpoint implemented in `routes/api/users.js`
- Token storage keys used:
  - Frontend: `'access_token'`, `'refresh_token'`
  - Admin: `'mybeauty_access_token'`, `'mybeauty_refresh_token'`

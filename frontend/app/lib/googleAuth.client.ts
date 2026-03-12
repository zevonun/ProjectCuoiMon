// lib/googleAuth.client.ts
"use client";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_SCOPES,
  getRedirectUri,
} from './googleAuth.config';

/**
 * Tạo URL OAuth của Google.
 * Gọi hàm này rồi redirect browser sang URL đó → Google hiện popup cho phép → callback về app.
 */
export const getGoogleOAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  getRedirectUri(),
    response_type: 'code',
    scope:         GOOGLE_SCOPES,
    access_type:   'offline',   // lấy refresh token
    prompt:        'consent',   // luôn hiện consent screen (đảm bảo refresh token được cấp)
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Redirect browser sang Google OAuth.
 * Gọi từ button onClick.
 */
export const redirectToGoogle = (): void => {
  window.location.href = getGoogleOAuthUrl();
};

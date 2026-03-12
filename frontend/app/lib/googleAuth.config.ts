// lib/googleAuth.config.ts

export const GOOGLE_CLIENT_ID     = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID     || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET             || '';

// URL Google sẽ redirect về sau khi user cho phép
// Phải match EXACTLY với Authorized redirect URIs trong Google Cloud Console
export const getRedirectUri = (): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||      // production: https://yourdomain.com
    'http://localhost:3001';                  // dev

  return `${baseUrl}/api/auth/google/callback`;
};

// Scopes cần lấy từ Google
export const GOOGLE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

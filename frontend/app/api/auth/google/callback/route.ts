// app/api/auth/google/callback/route.ts
import { NextResponse } from 'next/server';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  getRedirectUri,
} from '../../../../lib/googleAuth.config';  // ← chỉ 5 dấu ../

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  const url      = new URL(request.url);
  const code     = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  // ── Google trả về error (user từ chối chấp nhận) ──
  if (errorParam || !code) {
    console.error('❌ Google OAuth error:', errorParam);
    return NextResponse.redirect(new URL('/login?error=google_denied', url.origin));
  }

  try {
    // ── Bước 1: Exchange authorization code → tokens ──
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  getRedirectUri(),
        grant_type:    'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const tokenErr = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenErr);
      return NextResponse.redirect(new URL('/login?error=token_exchange', url.origin));
    }

    const tokenData = await tokenResponse.json();
    // tokenData có: access_token, id_token, refresh_token, expires_in

    // ── Bước 2: Lấy user info từ Google (userinfo endpoint) ──
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('❌ Userinfo fetch failed');
      return NextResponse.redirect(new URL('/login?error=userinfo', url.origin));
    }

    const googleUser = await userInfoResponse.json();
    // googleUser có: sub, email, name, picture, email_verified, ...

    if (!googleUser.email_verified) {
      return NextResponse.redirect(new URL('/login?error=email_not_verified', url.origin));
    }

    // ── Bước 3: Gửi về backend để create/find user + cấp JWT ──
    const backendResponse = await fetch(`${BACKEND_URL}/api/users/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleId:  googleUser.sub,
        email:     googleUser.email,
        name:      googleUser.name,
        picture:   googleUser.picture,
      }),
    });

    if (!backendResponse.ok) {
      const backendErr = await backendResponse.text();
      console.error('❌ Backend google-login failed:', backendErr);
      return NextResponse.redirect(new URL('/login?error=backend', url.origin));
    }

    const { user, token, refreshToken } = await backendResponse.json();

    // ── Bước 4: Lưu tokens vào cookie (HttpOnly) rồi redirect về home ──
    // Dùng searchParams để pass data về client-side page → page.tsx sẽ đọc và lưu vào localStorage
    const params = new URLSearchParams({
      token,
      refreshToken,
      user: JSON.stringify(user),
    });

    const redirectUrl = new URL(`/?google_login=success&${params.toString()}`, url.origin);

    return NextResponse.redirect(redirectUrl);

  } catch (err) {
    console.error('❌ Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=unknown', url.origin));
  }
}

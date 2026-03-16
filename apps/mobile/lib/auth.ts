import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// TODO: Enable when SMS provider configured
export async function sendOtp(phone: string): Promise<{ error: any }> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  return { error };
}

export async function verifyOtp(
  phone: string,
  token: string,
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  return { data, error };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// IMPORTANT: In Supabase Dashboard → Authentication → URL Configuration
// Ensure "exp://127.0.0.1:8081/--/auth/callback" is in the Redirect URLs list.
// Implicit grant flow is enabled by default — no extra toggle needed.
export async function signInWithGoogle(): Promise<{ error: any }> {
  try {
    const redirectTo = 'exp://127.0.0.1:8081/--/auth/callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('[Auth] OAuth URL error:', error.message);
      return { error };
    }

    if (!data?.url) {
      return { error: new Error('No OAuth URL returned from Supabase') };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    console.log('[Auth] Browser result:', result.type);

    if (result.type !== 'success') {
      return { error: new Error(`Auth ${result.type}`) };
    }

    console.log('[Auth] Redirect URL:', result.url);

    // Implicit flow returns tokens in the hash fragment
    // e.g. exp://...#access_token=xxx&refresh_token=xxx
    const url = result.url;
    const hashIndex = url.indexOf('#');

    if (hashIndex !== -1) {
      const hash = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token') ?? '';

      console.log('[Auth] Has access_token:', !!accessToken);

      if (accessToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        console.log('[Auth] setSession error:', sessionError?.message ?? 'none');
        return { error: sessionError ?? null };
      }
    }

    // Fallback: PKCE ?code= param
    if (url.includes('code=')) {
      const { error: codeError } = await supabase.auth.exchangeCodeForSession(url);
      console.log('[Auth] exchangeCode error:', codeError?.message ?? 'none');
      return { error: codeError ?? null };
    }

    console.error('[Auth] No token or code in redirect URL');
    return { error: new Error('No auth data in redirect URL') };
  } catch (e: any) {
    console.error('[Auth] Exception:', e.message);
    return { error: e };
  }
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Profile functions live in lib/users.ts

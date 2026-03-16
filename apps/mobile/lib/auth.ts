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

    if (error) return { error };
    if (!data?.url) return { error: new Error('No OAuth URL') };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    console.log('[Auth] Browser result:', result.type);
    if (result.type === 'success') {
      console.log('[Auth] Redirect URL:', result.url);
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { error: new Error('Sign in cancelled') };
    }

    if (result.type !== 'success') {
      return { error: new Error('Sign in failed') };
    }

    const url = result.url;

    // Check if the URL itself is an error response
    if (url.includes('error=') && !url.includes('access_token') && !url.includes('code=')) {
      const urlParams = new URL(url.replace('#', '?'));
      const errorDesc = urlParams.searchParams.get('error_description') ?? 'Unknown error';
      console.error('[Auth] OAuth error in redirect:', errorDesc);

      // Even though the redirect has an error, Supabase may have already
      // established the session. Check before giving up.
      await new Promise(r => setTimeout(r, 500));
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (sessionCheck.session?.user) {
        console.log('[Auth] Session exists despite error URL — auth succeeded');
        return { error: null };
      }

      return { error: new Error(errorDesc) };
    }

    // Handle implicit flow — tokens in hash fragment
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hash = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token') ?? '';

      if (accessToken) {
        console.log('[Auth] Implicit flow — setting session');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        return { error: sessionError ?? null };
      }
    }

    // Handle PKCE flow — code in query params
    if (url.includes('code=')) {
      console.log('[Auth] PKCE flow — exchanging code');
      const { error: codeError } = await supabase.auth.exchangeCodeForSession(url);
      return { error: codeError ?? null };
    }

    // Last resort: check if session exists anyway
    const { data: finalCheck } = await supabase.auth.getSession();
    if (finalCheck.session) {
      console.log('[Auth] Session found via final check');
      return { error: null };
    }

    return { error: new Error('No auth data in redirect') };
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

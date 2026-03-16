import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Redirect } from 'expo-router';
import {
  useFonts,
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();

// Module-level guard — prevents React Strict Mode double-mount from
// registering two listeners and firing INITIAL_SESSION twice.
let authListenerRegistered = false;

/**
 * AuthGate — rendered **inside** the Stack, so the navigator is
 * guaranteed to be mounted when any Redirect fires.
 *
 * Routing logic:
 *  • No user                → stay at "/" (splash / sign-in)
 *  • User, no onboarding    → /nametag
 *  • User, onboarded, INITIAL_SESSION (cold boot) → /feed
 *  • User, onboarded, SIGNED_IN (fresh login)     → /welcome-back
 */
function AuthGate() {
  const { pendingRoute } = useAuthStore();

  if (!pendingRoute) return null;
  return <Redirect href={pendingRoute as any} />;
}

export default function RootLayout() {
  const { setUserId, clearAuth, fetchProfile } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Syne_400Regular,
    Syne_500Medium,
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (authListenerRegistered) return;
    authListenerRegistered = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log(`[Layout] Auth event: ${event} | user: ${session?.user?.id || 'none'}`);

      if (session?.user) {
        setUserId(session.user.id);
        const profile = await fetchProfile(session.user.id);

        if (!profile?.onboarding_completed) {
          useAuthStore.setState({ pendingRoute: '/nametag' });
        } else if (event === 'INITIAL_SESSION') {
          useAuthStore.setState({ pendingRoute: '/feed' });
        } else if (event === 'SIGNED_IN') {
          useAuthStore.setState({ pendingRoute: '/welcome-back' });
        }
      }

      if (event === 'INITIAL_SESSION') {
        useAuthStore.setState({ isAuthReady: true });
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        clearAuth();
        useAuthStore.setState({ isAuthReady: true, pendingRoute: '/' });
      }
    });

    return () => {
      authListenerRegistered = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="tuned-in" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome-back" options={{ animation: 'fade' }} />
        <Stack.Screen name="nametag" options={{ animation: 'fade' }} />
        <Stack.Screen name="feed" options={{ animation: 'fade' }} />
        <Stack.Screen name="moodboard" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="item/[id]" options={{ animation: 'fade', headerShown: false }} />
      </Stack>
      {/* AuthGate MUST be outside the Stack but inside GestureHandlerRootView.
          Expo Router's Redirect works from anywhere inside the ExpoRoot tree once 
          the Stack is mounted. */}
      <AuthGate />
    </GestureHandlerRootView>
  );
}

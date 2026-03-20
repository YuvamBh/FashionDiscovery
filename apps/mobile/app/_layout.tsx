import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    console.log('[Layout] Initializing Auth Listener...');

    const resolveSession = async (session: any) => {
      const user = session?.user;
      if (!user) {
        console.log('[Layout] No session found. Marking Auth Ready.');
        useAuthStore.setState({ isAuthReady: true, authOutcome: null });
        return;
      }

      console.log('[Layout] Resolving session for:', user.id);
      setUserId(user.id);
      
      try {
        // Fetch profile with retry logic
        const profile = await fetchProfile(user.id);
        const outcome = profile?.onboarding_completed ? 'feed' : 'nametag';
        
        console.log(`[Layout] Session resolved. Outcome: ${outcome}`);
        useAuthStore.setState({ 
          isAuthReady: true, 
          authOutcome: outcome as 'feed' | 'nametag'
        });
      } catch (err) {
        console.error('[Layout] Error during profile resolution:', err);
        // Fallback to nametag so the user isn't stuck
        useAuthStore.setState({ isAuthReady: true, authOutcome: 'nametag' });
      }
    };

    // 1. Check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Layout] Initial session check result:', session?.user?.id ?? 'none');
      resolveSession(session);
    });

    // 2. Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Layout] Auth event: ${event} | user: ${session?.user?.id ?? 'none'}`);

      if (event === 'SIGNED_OUT') {
        setUserId(null);
        clearAuth();
        useAuthStore.setState({ isAuthReady: true, authOutcome: null });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        resolveSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'fade',
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)/index" options={{ animation: 'fade' }} />
        <Stack.Screen name="nametag" options={{ animation: 'fade' }} />
        <Stack.Screen name="identity-secured" options={{ animation: 'fade' }} />
        <Stack.Screen name="feed" options={{ animation: 'fade' }} />
        <Stack.Screen name="moodboard" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="rooms" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="item/[id]" options={{ animation: 'fade' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

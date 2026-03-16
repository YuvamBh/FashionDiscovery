import { useEffect } from 'react';
import { Stack, SplashScreen, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../lib/supabase';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    // Only register after fonts are ready so NavigationContainer is mounted
    if (!fontsLoaded && !fontError) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: { user: { id: string } } | null) => {
        console.log('[Layout] Auth event:', event);
        if (event === 'SIGNED_IN' && session?.user) {
          void (async () => {
            const { data } = await supabase
              .from('users')
              .select('calibration_completed')
              .eq('id', session.user.id)
              .single();

            if (data?.calibration_completed) {
              router.replace('/feed');
            } else {
              router.replace('/(calibration)/style-preference');
            }
          })();
        }
        if (event === 'SIGNED_OUT') {
          router.replace('/');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
        <Stack.Screen name="welcome" options={{ animation: 'none' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(calibration)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="name-setup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="vibe" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="brands" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="fit" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="categories" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="curating" options={{ animation: 'fade' }} />
        <Stack.Screen name="calibration" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="tuned-in" options={{ animation: 'fade' }} />
        <Stack.Screen name="feed" options={{ animation: 'fade' }} />
        <Stack.Screen name="moodboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="item/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

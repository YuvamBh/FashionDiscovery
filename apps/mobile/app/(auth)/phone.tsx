import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

// Phone auth is disabled until SMS provider is configured.
// Redirect any deep-link traffic back to the auth index.
export default function PhoneAuthScreen() {
  useEffect(() => {
    router.replace('/(auth)');
  }, []);
  return <View />;
}

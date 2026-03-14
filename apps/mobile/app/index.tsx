import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Index() {
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          router.replace('/feed');
        } else {
          router.replace('/welcome');
        }
      })
      .catch(() => {
        router.replace('/welcome');
      });
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});

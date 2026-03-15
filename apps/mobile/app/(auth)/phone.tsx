import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
// import { supabase } from '../../lib/supabase';

export default function PhoneAuthScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSendCode = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    
    try {
      // TODO: Replace with actual Supabase OTP trigger
      // const { error } = await supabase.auth.signInWithOtp({ phone });
      // if (error) throw error;
      
      console.log('Mock OTP sent to:', phone);
      // Simulate network
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Navigate to verify screen, passing phone number
      router.push({
        pathname: '/(auth)/verify',
        params: { phone }
      });
    } catch (e) {
      console.error(e);
      // Handle error state
    } finally {
      setLoading(false);
    }
  };

  const isValidNumber = phone.replace(/\D/g, '').length >= 10;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <GradientBackground colors={['#0a0a0a', '#111111', '#050505']} />
        
        <View style={styles.header}>
          <Text style={styles.title}>What's your{'\n'}number?</Text>
          <Text style={styles.subtitle}>
            We'll send a code to verify your identity and protect the community from bots.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+1</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="(555) 000-0000"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="phone-pad"
            autoFocus
            value={phone}
            onChangeText={setPhone}
            maxLength={14}
            textContentType="telephoneNumber"
            returnKeyType="done"
          />
        </View>

        <View style={styles.footer}>
          <AnimatedButton
            title={loading ? 'Sending code...' : 'Send confirmation code'}
            onPress={handleSendCode}
            disabled={!isValidNumber || loading}
            variant={isValidNumber ? 'primary' : 'secondary'}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 28,
  },
  header: {
    marginTop: 100,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 40,
    color: '#ffffff',
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryCode: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontFamily: 'Syne_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 1,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});

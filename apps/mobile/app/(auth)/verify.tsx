import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
// import { supabase } from '../../lib/supabase';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const displayPhone = phone || "your number";

  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true);
    setErrorStatus(null);
    
    try {
      // TODO: Replace with actual Supabase OTP verification
      // const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
      // if (error) throw error;
      
      console.log('Mock OTP Verified:', code);
      // Simulate network
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // If verification succeeds, route to the next flow (profiling)
      router.replace('/name-setup');
    } catch (e: any) {
      console.error(e);
      setErrorStatus(e.message || "Invalid code format.");
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const isValidCode = code.length === 6;

  // Auto-submit when user finishes typing the 6 digits
  useEffect(() => {
    if (isValidCode) {
      handleVerify();
    }
  }, [code, isValidCode]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <GradientBackground colors={['#0a0a0a', '#111111', '#050505']} />
        
        <View style={styles.header}>
          <Text style={styles.title}>Enter code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit confirmation to {displayPhone}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, errorStatus && styles.inputError]}
            placeholder="000000"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="number-pad"
            autoFocus
            value={code}
            onChangeText={(val) => {
              setErrorStatus(null);
              setCode(val.replace(/[^0-9]/g, ''));
            }}
            maxLength={6}
            textContentType="oneTimeCode"
          />
          {errorStatus && (
            <Text style={styles.errorText}>{errorStatus}</Text>
          )}
        </View>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive it? </Text>
          <TouchableOpacity onPress={() => console.log('Resending code...')}>
            <Text style={styles.resendLink}>Resend code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <AnimatedButton
            title={loading ? 'Verifying...' : 'Verify'}
            onPress={handleVerify}
            disabled={!isValidCode || loading}
            variant={isValidCode ? 'primary' : 'secondary'}
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
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontFamily: 'Syne_600SemiBold',
    fontSize: 32,
    color: '#ffffff',
    letterSpacing: 24,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: 'rgba(231,76,60,0.05)',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: '#e74c3c',
    marginTop: 12,
    fontSize: 13,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  resendLink: {
    fontFamily: 'Inter_500Medium',
    color: '#ffffff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});

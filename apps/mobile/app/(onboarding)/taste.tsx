import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressDots } from '../../components/onboarding/ProgressDots';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

export default function TasteScreen() {
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(24);

  useEffect(() => {
    contentOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 800, easing: ease })
    );
    contentY.value = withDelay(
      100,
      withTiming(0, { duration: 800, easing: ease })
    );
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Abstract radial/gradient texture representing a fingerprint/algorithm */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop' }}
        style={styles.background}
      >
        <LinearGradient
          colors={['rgba(10,10,10,0.5)', '#0a0a0a', '#050505']}
          style={styles.gradient}
          locations={[0, 0.6, 1]}
        />
        
        <View style={styles.content}>
          <Animated.View style={contentStyle}>
            
            {/* Mock visualization of taste core tags */}
            <View style={styles.tasteTags}>
              <View style={[styles.pill, { opacity: 0.6 }]}><Text style={styles.pillText}>MINIMAL</Text></View>
              <View style={[styles.pill, { opacity: 0.8 }]}><Text style={styles.pillText}>ARCHIVAL</Text></View>
              <View style={styles.pill}><Text style={styles.pillText}>AVANT-GARDE</Text></View>
            </View>

            <Text style={styles.headline}>
              Build your{'\n'}taste{'\n'}fingerprint.
            </Text>
            <Text style={styles.subtitle}>
              The more you explore, the sharper your feed becomes. Discover your aesthetic through curation.
            </Text>
          </Animated.View>
        </View>

        <View style={styles.bottomSection}>
          <ProgressDots total={3} current={2} />
          <AnimatedButton 
            title="Create your profile" 
            onPress={() => router.push('/(auth)')}
            variant="primary"
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  background: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  tasteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1,
  },
  headline: {
    fontFamily: 'Syne_700Bold',
    fontSize: 44,
    color: '#ffffff',
    lineHeight: 48,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
});

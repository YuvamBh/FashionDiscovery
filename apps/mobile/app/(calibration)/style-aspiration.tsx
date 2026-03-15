import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const ASPIRATIONS = [
  'More put together',
  'More fashion-forward',
  'More minimal',
  'More confident',
  'More experimental',
  'More polished',
  'More timeless',
  'Still exploring'
];

function SingleSelectRow({ label, isSelected, onPress }: { label: string, isSelected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.97)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={onPress}
        style={[styles.row, isSelected && styles.rowSelected]}
      >
        <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
          {label}
        </Text>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function StyleAspirationScreen() {
  const { styleAspiration, setStyleAspiration } = useCalibrationStore();

  const handleSelect = (aspiration: string) => {
    setStyleAspiration(aspiration);
  };

  const handleContinue = () => {
    router.push('/(calibration)/self-perception');
  };

  const isComplete = styleAspiration !== null;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={4} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What are you trying to move toward?</Text>
        <Text style={styles.subtitle}>Select the statement that resonates most.</Text>

        <View style={styles.list}>
          {ASPIRATIONS.map((aspiration) => (
            <SingleSelectRow
              key={aspiration}
              label={aspiration}
              isSelected={styleAspiration === aspiration}
              onPress={() => handleSelect(aspiration)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!isComplete}
          variant={isComplete ? 'primary' : 'secondary'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 36,
    color: '#fff',
    lineHeight: 42,
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 40,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  rowSelected: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  rowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  rowTextSelected: {
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#ffffff',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
  },
});

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GradientBackground } from '../../components/GradientBackground';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ProgressHeader } from '../../components/calibration/ProgressHeader';
import { useCalibrationStore } from '../../store/calibrationStore';

const APP_GOALS = [
  'Discover new brands',
  'Find pieces early',
  'Build my style',
  'Curate moodboards',
  'Track future drops',
  'See what\'s trending',
  'Refine my taste',
  'Influence what brands launch'
];

function MultiSelectRow({ label, isSelected, onPress }: { label: string, isSelected: boolean, onPress: () => void }) {
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
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AppGoalsScreen() {
  const { appGoals, setAppGoals } = useCalibrationStore();

  const toggleGoal = (goal: string) => {
    if (appGoals.includes(goal)) {
      setAppGoals(appGoals.filter(g => g !== goal));
    } else {
      setAppGoals([...appGoals, goal]);
    }
  };

  const handleContinue = () => {
    router.push('/(calibration)/discovery-frequency');
  };

  const isComplete = appGoals.length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#050505', '#111', '#050505']} />
      <ProgressHeader currentStep={6} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What do you want more of from this app?</Text>
        <Text style={styles.subtitle}>Select the core reasons you're here.</Text>

        <View style={styles.list}>
          {APP_GOALS.map((goal) => (
            <MultiSelectRow
              key={goal}
              label={goal}
              isSelected={appGoals.includes(goal)}
              onPress={() => toggleGoal(goal)}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  checkmark: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 16,
  },
});

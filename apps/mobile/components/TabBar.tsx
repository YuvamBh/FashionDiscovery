import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, size, tracking } from '../lib/tokens';

const TABS = [
  { id: 'feed',    label: 'Discover', route: '/feed',      icon: '◈' },
  { id: 'saved',   label: 'Saved',    route: '/moodboard', icon: '⊟' },
  { id: 'profile', label: 'Profile',  route: '/profile',   icon: '◯' },
] as const;

export function TabBar({ active }: { active: 'feed' | 'saved' | 'profile' }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.topEdge} />
      <View style={[styles.row, { paddingBottom: insets.bottom + 8 }]}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={styles.tab}
              onPress={() => {
                if (tab.id !== active) {
                  router.push(tab.route as any);
                }
              }}
            >
              <Text style={[styles.icon, isActive ? styles.activeText : styles.inactiveText]}>
                {tab.icon}
              </Text>
              <Text style={[styles.label, isActive ? styles.activeText : styles.inactiveText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.primary,
  },
  topEdge: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
  },
  row: {
    flexDirection: 'row',
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    textTransform: 'uppercase',
    letterSpacing: tracking.widest,
  },
  activeText: {
    color: colors.text.primary,
  },
  inactiveText: {
    color: colors.text.tertiary,
  },
});

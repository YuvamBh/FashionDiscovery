import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { getUserSignalCount } from '../lib/signals';
import { signOut } from '../lib/auth';

type UserProfile = {
  id: string;
  phone_number: string;
  authority_score: number;
  taste_profile: { styles?: string[]; initialized_at?: string };
  total_signals: number;
};

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [signalCount, setSignalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { setLoading(false); return; }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', auth.user.id)
        .single();

      if (data) setUser(data);

      const { count } = await getUserSignalCount(auth.user.id);
      setSignalCount(count);
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/onboarding');
  };

  const maskedPhone = user?.phone_number
    ? user.phone_number.slice(0, 3) + ' *** ' + user.phone_number.slice(-4)
    : '—';

  const styles_ = user?.taste_profile?.styles ?? [];
  const authorityScore = user?.authority_score ?? 0;
  const authorityLevel =
    authorityScore >= 75 ? 'Taste Authority' :
    authorityScore >= 40 ? 'Rising Tastemaker' :
    'New Discoverer';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.phone_number?.slice(-2) ?? 'FD'}
            </Text>
          </View>
          <View style={styles.identityInfo}>
            <Text style={styles.phone}>{maskedPhone}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{authorityLevel}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{signalCount}</Text>
            <Text style={styles.statLabel}>SIGNALS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(authorityScore)}</Text>
            <Text style={styles.statLabel}>AUTHORITY</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{styles_.length}</Text>
            <Text style={styles.statLabel}>STYLES</Text>
          </View>
        </View>

        {/* Taste fingerprint */}
        {styles_.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TASTE FINGERPRINT</Text>
            <View style={styles.tags}>
              {styles_.map((s) => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Authority meter */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFLUENCE SCORE</Text>
          <View style={styles.meterBar}>
            <View style={[styles.meterFill, { width: `${Math.min(authorityScore, 100)}%` }]} />
          </View>
          <Text style={styles.meterCaption}>
            Your signals carry {authorityScore < 30 ? 'baseline' : authorityScore < 60 ? 'growing' : 'strong'} weight with brands
          </Text>
        </View>

        {/* Sign out */}
        {user && (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/feed')}>
          <Text style={styles.tabIcon}>◈</Text>
          <Text style={styles.tabLabel}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/moodboard')}>
          <Text style={styles.tabIcon}>⊞</Text>
          <Text style={styles.tabLabel}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
          <Text style={[styles.tabIcon, styles.tabActive]}>◯</Text>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 64,
    paddingBottom: 32,
  },
  backBtn: {
    fontSize: 22,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  identityInfo: {
    gap: 6,
  },
  phone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    color: '#555',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 32,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    color: '#333',
    letterSpacing: 2,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1e1e1e',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 3,
    marginBottom: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  tagText: {
    fontSize: 13,
    color: '#fff',
  },
  meterBar: {
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginBottom: 10,
  },
  meterFill: {
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  meterCaption: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  signOutBtn: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    color: '#333',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingBottom: 32,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 20,
    color: '#333',
  },
  tabActive: {
    color: '#fff',
  },
  tabLabel: {
    fontSize: 10,
    color: '#333',
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: '#fff',
  },
});

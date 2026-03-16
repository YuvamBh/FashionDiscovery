import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors, fonts, size, space, tracking } from '../lib/tokens';
import { getSavedItems } from '../lib/signals';
import { supabase } from '../lib/supabase';
import { TabBar } from '../components/TabBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = space[4];
const COL_GAP = space[3];
const ITEM_WIDTH = SCREEN_WIDTH / 2 - H_PAD - COL_GAP / 2;
const ITEM_HEIGHT = Math.round(ITEM_WIDTH / 0.78);

type BoardItem = {
  id: string;
  imageUrl: string;
  name: string;
  brandName: string;
};

function itemFromRow(row: any): BoardItem | null {
  const p = row?.products;
  if (!p) return null;
  return {
    id: p.id,
    imageUrl: p.images?.[0] ?? '',
    name: p.name ?? '',
    brandName: p.brands?.name ?? '',
  };
}

// ─── BoardCard ────────────────────────────────────────────────────────────────

function BoardCard({ item }: { item: BoardItem }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/item/[id]',
          params: { id: item.id, name: item.name, brandName: item.brandName },
        })
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <Text style={styles.cardBrand} numberOfLines={1}>
        {item.brandName}
      </Text>
      <Text style={styles.cardName} numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  );
}

// ─── MoodboardScreen ──────────────────────────────────────────────────────────

export default function MoodboardScreen() {
  const insets = useSafeAreaInsets();
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await getSavedItems(user.id);
        if (!data) return;

        const items = data
          .map(itemFromRow)
          .filter((i: BoardItem | null): i is BoardItem => i !== null);

        setBoardItems(items);
      } catch {
        // silent — show empty state
      }
    })();
  }, []);

  const isEmpty = boardItems.length === 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 28 }]}>
        <Text style={styles.headerLabel}>YOUR BOARD</Text>
        <Text style={styles.headerTitle}>
          {isEmpty ? 'Nothing saved yet' : `${boardItems.length} pieces`}
        </Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
          <Text style={styles.emptySubtitle}>
            Signal items in the Drop Room to build your board.
          </Text>
        </View>
      ) : (
        <FlatList
          data={boardItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <BoardCard item={item} />}
        />
      )}

      <TabBar active="saved" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    paddingHorizontal: space[7],
    paddingBottom: space[5],
  },
  headerLabel: {
    fontFamily: fonts.body,
    fontSize: size.xs,
    color: colors.text.tertiary,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
    marginBottom: space[2],
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: size.xxxl,
    color: colors.text.primary,
    letterSpacing: tracking.tight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[10],
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: size.xl,
    color: colors.text.tertiary,
    letterSpacing: tracking.tight,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: space[3],
    paddingHorizontal: space[10],
    lineHeight: 22,
  },
  grid: {
    paddingHorizontal: H_PAD,
    paddingBottom: 120,
    gap: space[4],
    marginTop: space[6],
  },
  row: {
    gap: COL_GAP,
  },
  card: {
    width: ITEM_WIDTH,
  },
  cardImage: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: colors.bg.elevated,
  },
  cardBrand: {
    fontFamily: fonts.displayMedium,
    fontSize: size.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: tracking.widest,
    marginTop: space[2],
  },
  cardName: {
    fontFamily: fonts.body,
    fontSize: size.sm,
    color: colors.text.tertiary,
    marginTop: space[1],
  },
});

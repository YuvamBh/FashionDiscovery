import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { getSavedProducts } from '../lib/signals';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;

type SavedItem = {
  product_id: string;
  products: {
    id: string;
    name: string;
    images: string[];
    brands?: { name: string };
  } | null;
};

export default function Moodboard() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setLoading(false); return; }

    const { data } = await getSavedProducts(auth.user.id);
    if (data) setItems(data as unknown as SavedItem[]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }: { item: SavedItem }) => {
    const product = item.products;
    if (!product) return null;
    const imageUrl = Array.isArray(product.images) ? product.images[0] : product.images;

    return (
      <View style={styles.item}>
        <Image
          source={{ uri: imageUrl || `https://picsum.photos/300/400?random=${product.id}` }}
          style={styles.itemImage}
        />
        <Text style={styles.itemBrand} numberOfLines={1}>
          {product.brands?.name || '—'}
        </Text>
        <Text style={styles.itemName} numberOfLines={1}>
          {product.name}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Saved</Text>
          {items.length > 0 && (
            <Text style={styles.count}>{items.length} items</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#333" />
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.product_id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#333"
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptySubtitle}>Swipe up on items in your feed to save them here</Text>
            </View>
          }
        />
      )}

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/feed')}>
          <Text style={styles.tabIcon}>◈</Text>
          <Text style={styles.tabLabel}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
          <Text style={[styles.tabIcon, styles.tabActive]}>⊞</Text>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
          <Text style={styles.tabIcon}>◯</Text>
          <Text style={styles.tabLabel}>Profile</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backBtn: {
    fontSize: 22,
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
    letterSpacing: 1,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  item: {
    width: ITEM_SIZE,
  },
  itemImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    borderRadius: 12,
    backgroundColor: '#111',
    marginBottom: 8,
  },
  itemBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 13,
    color: '#888',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#2a2a2a',
    textAlign: 'center',
    lineHeight: 22,
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

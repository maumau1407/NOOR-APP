import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { MarketplaceStackParamList } from '../navigation/MarketplaceNavigator';
import { formatPrice, getListings } from '../services/listings';
import { LISTING_CATEGORIES, type Listing, type ListingCategory } from '../types/listing';

type NavigationProp = NativeStackNavigationProp<MarketplaceStackParamList, 'MarketplaceList'>;
type CategoryFilter = ListingCategory | 'Tous';

export default function MarketplaceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Tous');

  useEffect(() => {
    getListings().then(setListings);
  }, []);

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    if (selectedCategory === 'Tous') return listings;
    return listings.filter((listing) => listing.category === selectedCategory);
  }, [listings, selectedCategory]);

  if (!listings) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsContainer}
      >
        {(['Tous', ...LISTING_CATEGORIES] as CategoryFilter[]).map((category) => {
          const isActive = category === selectedCategory;
          return (
            <Pressable
              key={category}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredListings}
        keyExtractor={(listing) => listing.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune annonce dans cette catégorie.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
            </View>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('NewListing')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  chipsContainer: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  chipsRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0f5132',
  },
  chipActive: {
    backgroundColor: '#0f5132',
  },
  chipText: {
    color: '#0f5132',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  grid: {
    padding: 12,
    gap: 12,
    paddingBottom: 96,
  },
  gridRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#f0f0f0',
  },
  cardBody: {
    padding: 10,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    minHeight: 36,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f5132',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
});

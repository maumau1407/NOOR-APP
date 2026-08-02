import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';
import { formatDistanceKm, getDistanceKm } from '../services/geo';
import { requestUserLocation } from '../services/location';
import { getMosques } from '../services/mosques';
import type { Coordinates } from '../types/prayer';
import type { Mosque } from '../types/mosque';

type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'MosquesList'>;
type SortMode = 'default' | 'distance';

export default function MosquesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [query, setQuery] = useState('');
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('default');

  useEffect(() => {
    getMosques().then(setMosques);
  }, []);

  useEffect(() => {
    // Réutilise la même permission de géolocalisation que l'écran Prières :
    // si elle a déjà été accordée, aucune nouvelle demande ne s'affiche.
    requestUserLocation().then((result) => {
      if (result.status === 'granted') {
        setUserCoordinates(result.coordinates);
      }
    });
  }, []);

  const filteredMosques = useMemo(() => {
    if (!mosques) return [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mosques;
    return mosques.filter(
      (mosque) =>
        mosque.name.toLowerCase().includes(normalizedQuery) ||
        mosque.neighborhood.toLowerCase().includes(normalizedQuery)
    );
  }, [mosques, query]);

  const sortedMosques = useMemo(() => {
    if (sortMode !== 'distance' || !userCoordinates) {
      return filteredMosques;
    }
    return [...filteredMosques].sort(
      (a, b) => getDistanceKm(userCoordinates, a) - getDistanceKm(userCoordinates, b)
    );
  }, [filteredMosques, sortMode, userCoordinates]);

  if (!mosques) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par nom ou quartier…"
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortChip, sortMode === 'default' && styles.sortChipActive]}
          onPress={() => setSortMode('default')}
        >
          <Text style={[styles.sortChipText, sortMode === 'default' && styles.sortChipTextActive]}>
            Par défaut
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.sortChip,
            sortMode === 'distance' && styles.sortChipActive,
            !userCoordinates && styles.sortChipDisabled,
          ]}
          disabled={!userCoordinates}
          onPress={() => setSortMode('distance')}
        >
          <Text style={[styles.sortChipText, sortMode === 'distance' && styles.sortChipTextActive]}>
            {userCoordinates ? 'Les plus proches' : 'Les plus proches (localisation...)'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={sortedMosques}
        keyExtractor={(mosque) => mosque.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune mosquée ne correspond à ta recherche.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('MosqueDetail', { mosqueId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              {userCoordinates && (
                <Text style={styles.cardDistance}>{formatDistanceKm(getDistanceKm(userCoordinates, item))}</Text>
              )}
            </View>
            <Text style={styles.cardNeighborhood}>{item.neighborhood}</Text>
            <Text style={styles.cardAddress}>{item.address}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#111',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0f5132',
  },
  sortChipActive: {
    backgroundColor: '#0f5132',
  },
  sortChipDisabled: {
    borderColor: '#ccc',
  },
  sortChipText: {
    color: '#0f5132',
    fontSize: 13,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#fff',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f5132',
    flexShrink: 1,
  },
  cardDistance: {
    fontSize: 13,
    color: '#555',
    fontVariant: ['tabular-nums'],
  },
  cardNeighborhood: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  cardAddress: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
    fontSize: 15,
  },
});

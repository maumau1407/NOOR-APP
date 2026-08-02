import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';
import { getMosques } from '../services/mosques';
import type { Mosque } from '../types/mosque';

type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'MosquesList'>;

export default function MosquesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getMosques().then(setMosques);
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

      <FlatList
        data={filteredMosques}
        keyExtractor={(mosque) => mosque.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune mosquée ne correspond à ta recherche.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('MosqueDetail', { mosqueId: item.id })}
          >
            <Text style={styles.cardName}>{item.name}</Text>
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
    marginBottom: 16,
    color: '#111',
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
  cardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f5132',
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

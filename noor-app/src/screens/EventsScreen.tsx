import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';
import { formatEventDateTime, getEvents, getUpcomingEvents } from '../services/events';
import { getMosques } from '../services/mosques';
import type { ReligiousEvent } from '../types/event';

type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'EventsList'>;

export default function EventsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [events, setEvents] = useState<ReligiousEvent[] | null>(null);
  const [mosqueNames, setMosqueNames] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getEvents(), getMosques()]).then(([allEvents, mosques]) => {
      setEvents(getUpcomingEvents(allEvents));
      setMosqueNames(Object.fromEntries(mosques.map((mosque) => [mosque.id, mosque.name])));
    });
  }, []);

  if (!events) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun événement à venir pour le moment.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{formatEventDateTime(item)}</Text>
            <Text style={styles.cardMosque}>{mosqueNames[item.mosqueId] ?? 'Mosquée inconnue'}</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('NewEvent')}>
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
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 96,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f5132',
  },
  cardDate: {
    fontSize: 14,
    color: '#111',
    textTransform: 'capitalize',
  },
  cardMosque: {
    fontSize: 13,
    color: '#555',
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

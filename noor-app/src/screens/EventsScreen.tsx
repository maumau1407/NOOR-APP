import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { EventsStackParamList } from '../navigation/EventsNavigator';
import { formatEventDateTime, getEvents, getEventsByMosqueId, getUpcomingEvents } from '../services/events';
import { getMosqueById, getMosques } from '../services/mosques';
import type { ReligiousEvent } from '../types/event';
import type { Mosque } from '../types/mosque';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventsList'>;
type NavigationProp = NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;

export default function EventsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<Props['route']>();
  const mosqueId = params?.mosqueId;

  const [events, setEvents] = useState<ReligiousEvent[] | null>(null);
  const [mosqueNames, setMosqueNames] = useState<Record<string, string>>({});
  const [filterMosque, setFilterMosque] = useState<Mosque | null>(null);

  useEffect(() => {
    getMosques().then((mosques) => {
      setMosqueNames(Object.fromEntries(mosques.map((mosque) => [mosque.id, mosque.name])));
    });
  }, []);

  useEffect(() => {
    if (mosqueId) {
      setEvents(null);
      Promise.all([getEventsByMosqueId(mosqueId), getMosqueById(mosqueId)]).then(([mosqueEvents, mosque]) => {
        setEvents(getUpcomingEvents(mosqueEvents));
        setFilterMosque(mosque ?? null);
      });
    } else {
      setEvents(null);
      setFilterMosque(null);
      getEvents().then((allEvents) => setEvents(getUpcomingEvents(allEvents)));
    }
  }, [mosqueId]);

  if (!events) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filterMosque && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterBannerText}>Événements de {filterMosque.name}</Text>
          <Pressable onPress={() => navigation.setParams({ mosqueId: undefined })}>
            <Text style={styles.filterBannerReset}>Voir tous les événements</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={events}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {filterMosque ? 'Aucun événement à venir pour cette mosquée.' : 'Aucun événement à venir pour le moment.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{formatEventDateTime(item)}</Text>
            {!filterMosque && (
              <Text style={styles.cardMosque}>{mosqueNames[item.mosqueId] ?? 'Mosquée inconnue'}</Text>
            )}
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
  filterBanner: {
    backgroundColor: '#e8f3ec',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filterBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f5132',
  },
  filterBannerReset: {
    fontSize: 13,
    color: '#0f5132',
    textDecorationLine: 'underline',
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

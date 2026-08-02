import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';
import { formatEventDateTime, getEventsByMosqueId, getUpcomingEvents } from '../services/events';
import { getMosqueById } from '../services/mosques';
import type { ReligiousEvent } from '../types/event';
import type { Mosque } from '../types/mosque';

type Props = NativeStackScreenProps<MosquesStackParamList, 'MosqueDetail'>;
type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'MosqueDetail'>;

export default function MosqueDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<Props['route']>();
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [events, setEvents] = useState<ReligiousEvent[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getMosqueById(params.mosqueId).then((result) => {
      if (result) {
        setMosque(result);
        navigation.setOptions({ title: result.name });
      } else {
        setNotFound(true);
      }
    });
    getEventsByMosqueId(params.mosqueId).then((mosqueEvents) => {
      setEvents(getUpcomingEvents(mosqueEvents));
    });
  }, [params.mosqueId, navigation]);

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Cette mosquée est introuvable.</Text>
      </View>
    );
  }

  if (!mosque) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{mosque.name}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Quartier</Text>
        <Text style={styles.value}>{mosque.neighborhood}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Adresse</Text>
        <Text style={styles.value}>{mosque.address}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Téléphone</Text>
        <Text style={styles.value}>{mosque.phone}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => Linking.openURL(`tel:${mosque.phone.replace(/\s/g, '')}`)}>
        <Text style={styles.buttonText}>Appeler</Text>
      </Pressable>

      <View style={styles.eventsSection}>
        <Text style={styles.eventsSectionTitle}>Événements à venir</Text>
        {!events ? (
          <ActivityIndicator color="#0f5132" />
        ) : events.length === 0 ? (
          <Text style={styles.infoText}>Aucun événement prévu pour le moment.</Text>
        ) : (
          events.map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{formatEventDateTime(event)}</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    gap: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f5132',
  },
  infoBlock: {
    gap: 2,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#888',
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
  button: {
    backgroundColor: '#0f5132',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsSection: {
    gap: 10,
  },
  eventsSectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#888',
  },
  eventCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f5132',
  },
  eventDate: {
    fontSize: 13,
    color: '#555',
    textTransform: 'capitalize',
  },
});

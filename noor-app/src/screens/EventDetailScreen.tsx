import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';
import { formatEventDateTime, getEventById } from '../services/events';
import { getMosqueById } from '../services/mosques';
import type { ReligiousEvent } from '../types/event';
import type { Mosque } from '../types/mosque';

type Props = NativeStackScreenProps<MosquesStackParamList, 'EventDetail'>;
type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<Props['route']>();
  const [event, setEvent] = useState<ReligiousEvent | null>(null);
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getEventById(params.eventId).then((result) => {
      if (!result) {
        setNotFound(true);
        return;
      }
      setEvent(result);
      navigation.setOptions({ title: result.title });
      getMosqueById(result.mosqueId).then((mosqueResult) => setMosque(mosqueResult ?? null));
    });
  }, [params.eventId, navigation]);

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Cet événement est introuvable.</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.dateTime}>{formatEventDateTime(event)}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Mosquée organisatrice</Text>
        <Text style={styles.value}>{mosque ? mosque.name : '…'}</Text>
        {mosque && <Text style={styles.subValue}>{mosque.neighborhood}</Text>}
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{event.description}</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f5132',
  },
  dateTime: {
    fontSize: 16,
    color: '#111',
    textTransform: 'capitalize',
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
  subValue: {
    fontSize: 14,
    color: '#555',
  },
});

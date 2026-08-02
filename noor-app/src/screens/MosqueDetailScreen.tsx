import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';
import { getMosqueById } from '../services/mosques';
import type { Mosque } from '../types/mosque';

type Props = NativeStackScreenProps<MosquesStackParamList, 'MosqueDetail'>;
type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'MosqueDetail'>;

export default function MosqueDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<Props['route']>();
  const [mosque, setMosque] = useState<Mosque | null>(null);
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

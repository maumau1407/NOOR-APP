import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import type { MarketplaceStackParamList } from '../navigation/MarketplaceNavigator';
import { formatPrice, getListingById } from '../services/listings';
import type { Listing } from '../types/listing';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'ListingDetail'>;
type NavigationProp = NativeStackNavigationProp<MarketplaceStackParamList, 'ListingDetail'>;

export default function ListingDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<Props['route']>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getListingById(params.listingId).then((result) => {
      if (result) {
        setListing(result);
        navigation.setOptions({ title: result.title });
      } else {
        setNotFound(true);
      }
    });
  }, [params.listingId, navigation]);

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Cette annonce est introuvable.</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f5132" />
      </View>
    );
  }

  const contactOnWhatsApp = () => {
    const phone = listing.sellerPhone.replace(/[\s+]/g, '');
    const message = `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur NOOR.`;
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: listing.imageUrl }} style={styles.image} />

      <View style={styles.body}>
        <Text style={styles.category}>{listing.category}</Text>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{listing.description}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Vendeur</Text>
          <Text style={styles.value}>{listing.sellerName}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Quartier</Text>
          <Text style={styles.value}>{listing.neighborhood}</Text>
        </View>

        <Pressable style={styles.button} onPress={contactOnWhatsApp}>
          <Text style={styles.buttonText}>Contacter le vendeur sur WhatsApp</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
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
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  body: {
    padding: 20,
    gap: 16,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0f5132',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  price: {
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
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

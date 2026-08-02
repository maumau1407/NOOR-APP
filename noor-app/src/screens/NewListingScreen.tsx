import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MarketplaceStackParamList } from '../navigation/MarketplaceNavigator';
import { LISTING_CATEGORIES, type ListingCategory } from '../types/listing';

type NavigationProp = NativeStackNavigationProp<MarketplaceStackParamList, 'NewListing'>;

export default function NewListingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ListingCategory | null>(null);
  const [neighborhood, setNeighborhood] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedNeighborhood = neighborhood.trim();
    const priceValue = Number(price.replace(',', '.'));

    if (!trimmedTitle || !category || !trimmedNeighborhood || !price || Number.isNaN(priceValue) || priceValue <= 0) {
      setError('Merci de remplir le titre, un prix valide, la catégorie et le quartier.');
      return;
    }

    setError(null);

    // Pas encore de sauvegarde réelle : Supabase sera branché ici plus tard.
    Alert.alert(
      'Annonce créée (aperçu)',
      [
        `Titre : ${trimmedTitle}`,
        `Prix : ${priceValue.toLocaleString('fr-FR')} FCFA`,
        `Catégorie : ${category}`,
        `Quartier : ${trimmedNeighborhood}`,
        description.trim() ? `Description : ${description.trim()}` : null,
        '',
        "Cette annonce n'est pas encore enregistrée (pas de backend branché).",
      ]
        .filter(Boolean)
        .join('\n'),
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex. Poulet fermier halal"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Prix (FCFA)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Ex. 5000"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.chipsRow}>
          {LISTING_CATEGORIES.map((item) => {
            const isActive = item === category;
            return (
              <Pressable
                key={item}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Quartier</Text>
        <TextInput
          style={styles.input}
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder="Ex. Cocody"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décris ton produit ou service…"
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Publier l'annonce</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  errorText: {
    color: '#b3261e',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0f5132',
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

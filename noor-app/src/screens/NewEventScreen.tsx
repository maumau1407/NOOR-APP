import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MosquesStackParamList } from '../navigation/MosquesNavigator';

type NavigationProp = NativeStackNavigationProp<MosquesStackParamList, 'NewEvent'>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export default function NewEventScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || !DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) {
      setError('Merci de remplir le titre, une date au format AAAA-MM-JJ et une heure au format HH:MM.');
      return;
    }

    setError(null);

    // Pas encore de sauvegarde réelle : Supabase sera branché ici plus tard.
    Alert.alert(
      'Événement créé (aperçu)',
      [
        `Titre : ${trimmedTitle}`,
        `Date : ${date}`,
        `Heure : ${time}`,
        description.trim() ? `Description : ${description.trim()}` : null,
        '',
        "Cet événement n'est pas encore enregistré (pas de backend branché).",
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
          placeholder="Ex. Conférence sur le Ramadan"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="AAAA-MM-JJ, ex. 2026-08-15"
          placeholderTextColor="#888"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Heure</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM, ex. 19:00"
          placeholderTextColor="#888"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décris l'événement…"
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Publier l'événement</Text>
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

import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFavoriteMosques } from '../hooks/useFavoriteMosques';
import { useMosquePrayerOverrides } from '../hooks/useMosquePrayerOverrides';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { MAX_FAVORITE_MOSQUES } from '../services/favorites';
import { getMosques } from '../services/mosques';
import {
  findNextPrayer,
  formatCountdown,
  formatTime,
  getMosquePrayerTimesForDate,
  PRAYER_LABELS,
} from '../services/prayerTimes';
import type { Mosque, MosquePrayerTimes } from '../types/mosque';
import type { PrayerName } from '../types/prayer';

const TIME_PATTERN = /^\d{2}:\d{2}$/;
const PRAYER_FORM_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const EMPTY_TIMES: Record<PrayerName, string> = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' };

export default function PrayersScreen() {
  const {
    locationState,
    requestLocation,
    now,
    todayPrayerTimes,
    nextPrayer: autoNextPrayer,
    notificationsEnabled,
    notificationsBusy,
    notificationsError,
    toggleNotifications,
  } = usePrayerTimes();

  const { favoriteIds, toggleFavorite } = useFavoriteMosques();
  const { overrides, saveOverride, clearOverride } = useMosquePrayerOverrides();
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const [editingMosque, setEditingMosque] = useState<Mosque | null>(null);
  const [editValues, setEditValues] = useState<Record<PrayerName, string>>(EMPTY_TIMES);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    getMosques().then(setMosques);
  }, []);

  const favoriteMosques = useMemo(() => {
    if (!mosques) return [];
    return favoriteIds
      .map((id) => mosques.find((mosque) => mosque.id === id))
      .filter((mosque): mosque is Mosque => Boolean(mosque));
  }, [mosques, favoriteIds]);

  // Priorité : horaires officiels (mosque.prayerTimes) > horaires saisis par
  // l'utilisateur (overrides) > calcul automatique par géolocalisation.
  const getEffectiveSource = (mosque: Mosque): MosquePrayerTimes | null =>
    mosque.prayerTimes ?? overrides[mosque.id] ?? null;

  const primaryFavorite = favoriteMosques[0];
  const primarySource = primaryFavorite ? getEffectiveSource(primaryFavorite) : null;

  const primaryNextPrayer = useMemo(() => {
    if (!primarySource) return null;
    const todayTimes = getMosquePrayerTimesForDate(primarySource, now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getMosquePrayerTimesForDate(primarySource, tomorrow);
    return findNextPrayer(todayTimes, tomorrowTimes[0], now);
  }, [primarySource, now]);

  const displayedNextPrayer = primaryNextPrayer ?? autoNextPrayer;

  const handleToggleFavorite = async (mosqueId: string) => {
    const result = await toggleFavorite(mosqueId);
    setPickerError(
      result === 'limit-reached'
        ? `Tu peux choisir au maximum ${MAX_FAVORITE_MOSQUES} mosquées favorites. Retire-en une d'abord.`
        : null
    );
  };

  const openEditModal = (mosque: Mosque) => {
    const existing = overrides[mosque.id];
    const seed = existing
      ? { ...existing }
      : todayPrayerTimes.length === 5
        ? (Object.fromEntries(todayPrayerTimes.map((p) => [p.name, formatTime(p.date)])) as Record<
            PrayerName,
            string
          >)
        : EMPTY_TIMES;
    setEditValues(seed);
    setEditError(null);
    setEditingMosque(mosque);
  };

  const closeEditModal = () => {
    setEditingMosque(null);
    setEditError(null);
  };

  const handleSaveOverride = async () => {
    const invalid = PRAYER_FORM_ORDER.some((name) => !TIME_PATTERN.test(editValues[name]));
    if (invalid) {
      setEditError('Merci de renseigner les 5 horaires au format HH:MM (ex. 05:15).');
      return;
    }
    if (!editingMosque) return;
    await saveOverride(editingMosque.id, editValues as MosquePrayerTimes);
    closeEditModal();
  };

  if (locationState.status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Localisation en cours…</Text>
      </View>
    );
  }

  if (locationState.status === 'denied' || locationState.status === 'error') {
    const message =
      locationState.status === 'denied'
        ? "NOOR a besoin de ta position pour calculer les heures de prière exactes de l'endroit où tu te trouves."
        : `Une erreur est survenue lors de la localisation : ${locationState.message}`;

    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Prières</Text>
        <Text style={styles.infoText}>{message}</Text>
        <Pressable style={styles.button} onPress={requestLocation}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </Pressable>
        {locationState.status === 'denied' && !locationState.canAskAgain && (
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => Linking.openSettings()}>
            <Text style={styles.buttonText}>Ouvrir les réglages</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prières</Text>

      <View style={styles.favoritesSection}>
        <Text style={styles.sectionLabel}>Mes mosquées favorites</Text>

        {favoriteMosques.length === 0 ? (
          <Pressable style={styles.favoritesInvite} onPress={() => setPickerVisible(true)}>
            <Text style={styles.favoritesInviteText}>
              Choisis une mosquée favorite pour suivre ses horaires précis →
            </Text>
          </Pressable>
        ) : (
          <>
            {favoriteMosques.map((mosque) => {
              const hasOfficialTimes = Boolean(mosque.prayerTimes);
              const override = overrides[mosque.id];
              const source = getEffectiveSource(mosque);
              const times = source ? getMosquePrayerTimesForDate(source, now) : todayPrayerTimes;

              return (
                <View key={mosque.id} style={styles.favoriteCard}>
                  <View style={styles.favoriteCardHeader}>
                    <Text style={styles.favoriteCardName}>{mosque.name}</Text>
                    <Pressable onPress={() => handleToggleFavorite(mosque.id)}>
                      <Text style={styles.favoriteRemove}>Retirer</Text>
                    </Pressable>
                  </View>

                  {!hasOfficialTimes && (
                    <Text style={styles.estimatedNote}>
                      {override ? 'Horaires renseignés par vous' : 'Horaires estimés (calcul automatique)'}
                    </Text>
                  )}

                  {times.length === 0 ? (
                    <Text style={styles.infoText}>Horaires indisponibles pour le moment.</Text>
                  ) : (
                    <View style={styles.favoriteTimesRow}>
                      {times.map((prayer) => (
                        <View key={prayer.name} style={styles.favoriteTimeItem}>
                          <Text style={styles.favoriteTimeLabel}>{prayer.label}</Text>
                          <Text style={styles.favoriteTimeValue}>{formatTime(prayer.date)}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {!hasOfficialTimes && (
                    <View style={styles.favoriteCardActions}>
                      <Pressable onPress={() => openEditModal(mosque)}>
                        <Text style={styles.favoriteCardActionText}>
                          {override ? 'Modifier les horaires' : 'Modifier les horaires de cette mosquée'}
                        </Text>
                      </Pressable>
                      {override && (
                        <Pressable onPress={() => clearOverride(mosque.id)}>
                          <Text style={styles.favoriteCardActionTextMuted}>
                            Réinitialiser (calcul automatique)
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
            <Pressable style={styles.editFavoritesButton} onPress={() => setPickerVisible(true)}>
              <Text style={styles.editFavoritesText}>Modifier mes favoris</Text>
            </Pressable>
          </>
        )}
      </View>

      {displayedNextPrayer && (
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Prochaine prière</Text>
          <Text style={styles.nextPrayerName}>{displayedNextPrayer.label}</Text>
          <Text style={styles.nextPrayerTime}>{formatTime(displayedNextPrayer.date)}</Text>
          <Text style={styles.countdown}>{formatCountdown(displayedNextPrayer.date, now)}</Text>
          {primaryNextPrayer && primaryFavorite && (
            <Text style={styles.nextPrayerSource}>D'après {primaryFavorite.name}</Text>
          )}
        </View>
      )}

      <Text style={styles.sectionLabel}>Horaires calculés (ta position)</Text>
      <View style={styles.list}>
        {todayPrayerTimes.map((prayer) => {
          const isNext =
            autoNextPrayer?.name === prayer.name && autoNextPrayer.date.getTime() === prayer.date.getTime();
          return (
            <View key={prayer.name} style={[styles.row, isNext && styles.rowActive]}>
              <Text style={[styles.rowLabel, isNext && styles.rowLabelActive]}>{prayer.label}</Text>
              <Text style={[styles.rowTime, isNext && styles.rowLabelActive]}>{formatTime(prayer.date)}</Text>
            </View>
          );
        })}
      </View>

      <Pressable
        style={[styles.button, notificationsEnabled && styles.buttonActive]}
        onPress={toggleNotifications}
        disabled={notificationsBusy}
      >
        {notificationsBusy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
          </Text>
        )}
      </Pressable>
      {notificationsError && <Text style={styles.errorText}>{notificationsError}</Text>}
      {Platform.OS === 'android' && notificationsEnabled && (
        <Text style={styles.hint}>
          Bug connu d'Expo Go : si les notifications ne sonnent pas, réouvre l'app pour les reprogrammer.
        </Text>
      )}

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Mes mosquées favorites</Text>
          <Text style={styles.modalSubtitle}>Choisis jusqu'à {MAX_FAVORITE_MOSQUES} mosquées.</Text>
          {pickerError && <Text style={styles.errorText}>{pickerError}</Text>}

          <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
            {(mosques ?? []).map((mosque) => {
              const selected = favoriteIds.includes(mosque.id);
              return (
                <Pressable
                  key={mosque.id}
                  style={[styles.modalRow, selected && styles.modalRowSelected]}
                  onPress={() => handleToggleFavorite(mosque.id)}
                >
                  <Text style={[styles.modalRowText, selected && styles.modalRowTextSelected]}>
                    {selected ? '✓ ' : ''}
                    {mosque.name}
                  </Text>
                  <Text style={[styles.modalRowSubtext, selected && styles.modalRowTextSelected]}>
                    {mosque.neighborhood}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.button} onPress={() => setPickerVisible(false)}>
            <Text style={styles.buttonText}>Terminé</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={editingMosque !== null} animationType="slide" onRequestClose={closeEditModal}>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Modifier les horaires</Text>
          {editingMosque && <Text style={styles.modalSubtitle}>{editingMosque.name}</Text>}

          {PRAYER_FORM_ORDER.map((name) => (
            <View key={name} style={styles.field}>
              <Text style={styles.label}>{PRAYER_LABELS[name]}</Text>
              <TextInput
                style={styles.input}
                value={editValues[name]}
                onChangeText={(text) => setEditValues((current) => ({ ...current, [name]: text }))}
                placeholder="HH:MM"
                placeholderTextColor="#888"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          ))}

          {editError && <Text style={styles.errorText}>{editError}</Text>}

          <Pressable style={styles.button} onPress={handleSaveOverride}>
            <Text style={styles.buttonText}>Enregistrer</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={closeEditModal}>
            <Text style={styles.buttonText}>Annuler</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#444',
  },
  sectionLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#888',
  },
  favoritesSection: {
    gap: 10,
  },
  favoritesInvite: {
    borderWidth: 1,
    borderColor: '#0f5132',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
  },
  favoritesInviteText: {
    color: '#0f5132',
    fontSize: 14,
    textAlign: 'center',
  },
  favoriteCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  favoriteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteCardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f5132',
    flexShrink: 1,
  },
  favoriteRemove: {
    fontSize: 13,
    color: '#b3261e',
  },
  estimatedNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  favoriteTimesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  favoriteTimeItem: {
    minWidth: 56,
  },
  favoriteTimeLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
  },
  favoriteTimeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    fontVariant: ['tabular-nums'],
  },
  favoriteCardActions: {
    gap: 4,
  },
  favoriteCardActionText: {
    fontSize: 13,
    color: '#0f5132',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  favoriteCardActionTextMuted: {
    fontSize: 13,
    color: '#888',
  },
  editFavoritesButton: {
    alignSelf: 'flex-start',
  },
  editFavoritesText: {
    color: '#0f5132',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  nextPrayerCard: {
    backgroundColor: '#0f5132',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  nextPrayerLabel: {
    color: '#d7f0e2',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPrayerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  nextPrayerTime: {
    color: '#fff',
    fontSize: 18,
  },
  countdown: {
    color: '#d7f0e2',
    fontSize: 15,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  nextPrayerSource: {
    color: '#d7f0e2',
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  rowActive: {
    backgroundColor: '#0f5132',
  },
  rowLabel: {
    fontSize: 16,
    color: '#111',
  },
  rowLabelActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rowTime: {
    fontSize: 16,
    color: '#111',
    fontVariant: ['tabular-nums'],
  },
  button: {
    backgroundColor: '#0f5132',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#8a1f11',
  },
  secondaryButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#b3261e',
    textAlign: 'center',
    fontSize: 14,
  },
  hint: {
    color: '#777',
    textAlign: 'center',
    fontSize: 12,
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
  modalContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0f5132',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  modalList: {
    flex: 1,
  },
  modalListContent: {
    gap: 10,
    paddingBottom: 12,
  },
  modalRow: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 14,
  },
  modalRowSelected: {
    borderColor: '#0f5132',
    backgroundColor: '#e8f3ec',
  },
  modalRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  modalRowSubtext: {
    fontSize: 13,
    color: '#555',
  },
  modalRowTextSelected: {
    color: '#0f5132',
  },
});

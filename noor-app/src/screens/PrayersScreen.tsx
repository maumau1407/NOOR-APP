import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFavoriteMosques } from '../hooks/useFavoriteMosques';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { MAX_FAVORITE_MOSQUES } from '../services/favorites';
import { getMosques } from '../services/mosques';
import { findNextPrayer, formatCountdown, formatTime, getMosquePrayerTimesForDate } from '../services/prayerTimes';
import type { Mosque } from '../types/mosque';

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
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  useEffect(() => {
    getMosques().then(setMosques);
  }, []);

  const favoriteMosques = useMemo(() => {
    if (!mosques) return [];
    return favoriteIds
      .map((id) => mosques.find((mosque) => mosque.id === id))
      .filter((mosque): mosque is Mosque => Boolean(mosque));
  }, [mosques, favoriteIds]);

  const primaryFavorite = favoriteMosques[0];

  const primaryNextPrayer = useMemo(() => {
    if (!primaryFavorite?.prayerTimes) return null;
    const todayTimes = getMosquePrayerTimesForDate(primaryFavorite.prayerTimes, now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getMosquePrayerTimesForDate(primaryFavorite.prayerTimes, tomorrow);
    return findNextPrayer(todayTimes, tomorrowTimes[0], now);
  }, [primaryFavorite, now]);

  const displayedNextPrayer = primaryNextPrayer ?? autoNextPrayer;

  const handleToggleFavorite = async (mosqueId: string) => {
    const result = await toggleFavorite(mosqueId);
    setPickerError(
      result === 'limit-reached'
        ? `Tu peux choisir au maximum ${MAX_FAVORITE_MOSQUES} mosquées favorites. Retire-en une d'abord.`
        : null
    );
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
              const times = mosque.prayerTimes
                ? getMosquePrayerTimesForDate(mosque.prayerTimes, now)
                : todayPrayerTimes;
              return (
                <View key={mosque.id} style={styles.favoriteCard}>
                  <View style={styles.favoriteCardHeader}>
                    <Text style={styles.favoriteCardName}>{mosque.name}</Text>
                    <Pressable onPress={() => handleToggleFavorite(mosque.id)}>
                      <Text style={styles.favoriteRemove}>Retirer</Text>
                    </Pressable>
                  </View>
                  {!mosque.prayerTimes && <Text style={styles.estimatedNote}>Horaires estimés (calcul automatique)</Text>}
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
  modalContainer: {
    flex: 1,
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

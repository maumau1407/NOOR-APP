import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { formatCountdown, formatTime } from '../services/prayerTimes';

export default function PrayersScreen() {
  const {
    locationState,
    requestLocation,
    now,
    todayPrayerTimes,
    nextPrayer,
    notificationsEnabled,
    notificationsBusy,
    notificationsError,
    toggleNotifications,
  } = usePrayerTimes();

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

      {nextPrayer && (
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Prochaine prière</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.label}</Text>
          <Text style={styles.nextPrayerTime}>{formatTime(nextPrayer.date)}</Text>
          <Text style={styles.countdown}>{formatCountdown(nextPrayer.date, now)}</Text>
        </View>
      )}

      <View style={styles.list}>
        {todayPrayerTimes.map((prayer) => {
          const isNext = nextPrayer?.name === prayer.name && nextPrayer.date.getTime() === prayer.date.getTime();
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
});

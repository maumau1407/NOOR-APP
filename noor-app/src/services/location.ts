import * as Location from 'expo-location';

import type { Coordinates } from '../types/prayer';

export type LocationRequestResult =
  | { status: 'granted'; coordinates: Coordinates }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };

export async function requestUserLocation(): Promise<LocationRequestResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return { status: 'denied', canAskAgain: permission.canAskAgain };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      status: 'granted',
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Impossible de récupérer la position.',
    };
  }
}

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { getFavoriteMosqueIds, MAX_FAVORITE_MOSQUES, setFavoriteMosqueIds } from '../services/favorites';

export type ToggleFavoriteResult = 'added' | 'removed' | 'limit-reached';

// Recharge la liste à chaque fois que l'écran reprend le focus, pour refléter
// un ajout/retrait fait depuis un autre onglet (ex. détail d'une mosquée).
export function useFavoriteMosques() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getFavoriteMosqueIds().then((ids) => {
        if (active) {
          setFavoriteIds(ids);
          setLoaded(true);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const toggleFavorite = useCallback(
    async (mosqueId: string): Promise<ToggleFavoriteResult> => {
      if (favoriteIds.includes(mosqueId)) {
        const next = favoriteIds.filter((id) => id !== mosqueId);
        setFavoriteIds(next);
        await setFavoriteMosqueIds(next);
        return 'removed';
      }
      if (favoriteIds.length >= MAX_FAVORITE_MOSQUES) {
        return 'limit-reached';
      }
      const next = [...favoriteIds, mosqueId];
      setFavoriteIds(next);
      await setFavoriteMosqueIds(next);
      return 'added';
    },
    [favoriteIds]
  );

  const isFavorite = useCallback((mosqueId: string) => favoriteIds.includes(mosqueId), [favoriteIds]);

  return { favoriteIds, loaded, toggleFavorite, isFavorite };
}

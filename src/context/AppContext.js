import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  initDatabase,
  getPreferences,
  savePreferences,
  getWatchlist,
  upsertWatchlistItem,
  removeWatchlistItem,
  getWatchlistEntry,
  setUserRating,
} from '../db/database';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState([]); // array of genre ids (numbers)
  const [providers, setProviders] = useState([]); // array of provider ids (numbers)

  useEffect(() => {
    (async () => {
      await initDatabase();
      const prefs = await getPreferences();
      if (prefs && prefs.favorite_genres) {
        setFavoriteGenres(prefs.favorite_genres.split(',').filter(Boolean).map(Number));
        setProviders((prefs.providers || '').split(',').filter(Boolean).map(Number));
        setOnboarded(true);
      }
      setReady(true);
    })();
  }, []);

  const savePrefs = useCallback(async (genreIds, providerIds) => {
    setFavoriteGenres(genreIds);
    setProviders(providerIds);
    await savePreferences(genreIds.join(','), providerIds.join(','));
    setOnboarded(true);
  }, []);

  // --- Watchlist actions ---
  const addToWatchlist = useCallback(async (media) => {
    await upsertWatchlistItem({
      media_id: media.id,
      media_type: media.media_type || (media.title ? 'movie' : 'tv'),
      title: media.title || media.name,
      poster_path: media.poster_path,
      vote_average: media.vote_average,
      status: 'PLAN_TO_WATCH',
    });
  }, []);

  const markAsWatched = useCallback(async (media, rating = null) => {
    await upsertWatchlistItem({
      media_id: media.id,
      media_type: media.media_type || (media.title ? 'movie' : 'tv'),
      title: media.title || media.name,
      poster_path: media.poster_path,
      vote_average: media.vote_average,
      status: 'WATCHED',
      user_rating: rating,
    });
  }, []);

  const removeItem = useCallback(async (mediaId, mediaType) => {
    await removeWatchlistItem(mediaId, mediaType);
  }, []);

  const fetchWatchlist = useCallback((status, orderBy) => getWatchlist(status, orderBy), []);
  const fetchEntry = useCallback((mediaId, mediaType) => getWatchlistEntry(mediaId, mediaType), []);
  const rateItem = useCallback((mediaId, mediaType, rating) => setUserRating(mediaId, mediaType, rating), []);

  const value = {
    ready,
    onboarded,
    favoriteGenres,
    providers,
    savePrefs,
    addToWatchlist,
    markAsWatched,
    removeItem,
    fetchWatchlist,
    fetchEntry,
    rateItem,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

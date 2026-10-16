import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { getOmdbRatings, getWatchmodeSources, getTvmazeInfo } from '../api/extras';
import { tmdb, backdropUrl, posterUrl, findTrailerKey, getWatchProviders } from '../api/tmdb';

export default function DetailScreen({ route, navigation }) {
  const { id, mediaType } = route.params;
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { addToWatchlist, markAsWatched, fetchEntry, rateItem } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [sources, setSources] = useState([]);
  const [tvInfo, setTvInfo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const details = mediaType === 'tv' ? await tmdb.tvDetails(id) : await tmdb.movieDetails(id);
      setData(details);
      const e = await fetchEntry(id, mediaType);
      setEntry(e);
      // Επιπλέον πηγές: φορτώνουν στο παρασκήνιο και δεν καθυστερούν την οθόνη.
      const imdbId = details.imdb_id || details.external_ids?.imdb_id;
      getOmdbRatings(imdbId).then(setRatings);
      getWatchmodeSources(imdbId).then(setSources);
      if (mediaType === 'tv') getTvmazeInfo(imdbId).then(setTvInfo);
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, mediaType, fetchEntry]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 60 }}>
          {t('common.error')}
        </Text>
      </SafeAreaView>
    );
  }

  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const runtime = data.runtime
    ? `${data.runtime} ${t('common.minutes')}`
    : data.number_of_seasons
    ? `${data.number_of_seasons} ${t('common.seasons')}`
    : null;
  const trailerKey = findTrailerKey(data.videos);
  const providers = getWatchProviders(data['watch/providers']);
  const cast = (data.credits?.cast || []).slice(0, 12);

  const mediaObj = { id: data.id, media_type: mediaType, title: data.title, name: data.name, poster_path: data.poster_path, vote_average: data.vote_average };
  const isInWatchlist = entry?.status === 'PLAN_TO_WATCH';
  const isWatched = entry?.status === 'WATCHED';

  const openTrailer = () => {
    if (trailerKey) Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
  };

  const handleAdd = async () => {
    await addToWatchlist(mediaObj);
    load();
  };

  const handleWatched = async () => {
    await markAsWatched(mediaObj);
    load();
  };

  const rate = async (stars) => {
    await rateItem(id, mediaType, stars);
    load();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View>
          <Image
            source={{ uri: backdropUrl(data.backdrop_path) || posterUrl(data.poster_path) }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Image source={{ uri: posterUrl(data.poster_path) }} style={styles.poster} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                {[year, runtime].filter(Boolean).join(' · ')}
              </Text>
              <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="star" size={13} color={theme.primaryText} />
                <Text style={{ color: theme.primaryText, fontWeight: '800', marginLeft: 4 }}>
                  {(data.vote_average ?? 0).toFixed(1)}/10
                </Text>
              </View>
              {ratings && (ratings.imdb || ratings.rotten || ratings.metascore) && (
                <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12.5 }}>
                  {[
                    ratings.imdb && `IMDb ${ratings.imdb}`,
                    ratings.rotten && `🍅 ${ratings.rotten}`,
                    ratings.metascore && `Metascore ${ratings.metascore}`,
                  ].filter(Boolean).join('  ·  ')}
                </Text>
              )}
              {tvInfo?.next && (
                <Text style={{ color: theme.textSecondary, marginTop: 6, fontSize: 12.5 }}>
                  {t('detail.next_episode')}: S{tvInfo.next.season}E{tvInfo.next.number} · {tvInfo.next.airdate}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actionsRow}>
            {trailerKey && (
              <ActionButton icon="logo-youtube" label={t('detail.trailer')} onPress={openTrailer} theme={theme} color={theme.danger} />
            )}
            <ActionButton
              icon={isInWatchlist ? 'checkmark-circle' : 'add-circle-outline'}
              label={isInWatchlist ? t('detail.in_watchlist') : t('detail.add_watchlist')}
              onPress={handleAdd}
              theme={theme}
            />
            <ActionButton
              icon={isWatched ? 'eye' : 'eye-outline'}
              label={isWatched ? t('detail.watched') : t('detail.mark_watched')}
              onPress={handleWatched}
              theme={theme}
            />
          </View>

          {isWatched && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6 }}>{t('detail.your_rating')}</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => rate(n)} hitSlop={8}>
                    <Ionicons
                      name={entry?.user_rating >= n ? 'star' : 'star-outline'}
                      size={26}
                      color={theme.primary}
                      style={{ marginRight: 4 }}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('detail.synopsis')}</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 21 }}>
            {data.overview && data.overview.length > 0 ? data.overview : t('detail.no_synopsis')}
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('detail.available_on')}</Text>
          {providers.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {providers.map((p) => (
                <View key={p.provider_id} style={styles.providerBadge}>
                  <Image source={{ uri: posterUrl(p.logo_path, 'w92') }} style={styles.providerLogo} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: theme.textSecondary }}>{t('detail.not_available')}</Text>
          )}

          {sources.length > 0 && (
            <View style={styles.linkRow}>
              {sources.map((src) => (
                <Pressable
                  key={src.name}
                  onPress={() => Linking.openURL(src.url)}
                  style={[styles.linkChip, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  <Ionicons name="open-outline" size={13} color={theme.primary} />
                  <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>{src.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {cast.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('detail.cast')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((c) => (
                  <View key={c.credit_id || c.id} style={styles.castItem}>
                    {c.profile_path ? (
                      <Image source={{ uri: posterUrl(c.profile_path, 'w185') }} style={styles.castPhoto} />
                    ) : (
                      <View style={[styles.castPhoto, { backgroundColor: theme.surfaceAlt }]} />
                    )}
                    <Text numberOfLines={1} style={{ color: theme.text, fontSize: 11.5, fontWeight: '600', width: 68, marginTop: 4 }}>
                      {c.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, onPress, theme, color }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name={icon} size={20} color={color || theme.primary} />
      <Text numberOfLines={2} style={{ color: theme.text, fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { width: '100%', height: 210 },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center' },
  body: { padding: 16, marginTop: -50 },
  headerRow: { flexDirection: 'row' },
  poster: { width: 110, height: 165, borderRadius: 12 },
  title: { fontSize: 19, fontWeight: '800' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 10 },
  sectionTitle: { fontSize: 15.5, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  linkChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  providerBadge: { marginRight: 10 },
  providerLogo: { width: 46, height: 46, borderRadius: 10 },
  castItem: { marginRight: 12, alignItems: 'center' },
  castPhoto: { width: 68, height: 68, borderRadius: 34 } });

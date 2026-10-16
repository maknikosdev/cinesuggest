import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';
import { tmdb } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import GenreChip from '../components/GenreChip';

export default function BrowseScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const lang = i18n.language?.startsWith('el') ? 'el-GR' : 'en-US';

  const [type, setType] = useState('movie'); // movie | tv
  const [genres, setGenres] = useState([]);
  const [genresError, setGenresError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [genre, setGenre] = useState(null);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Οι κατηγορίες διαφέρουν ανά τύπο (π.χ. οι σειρές δεν έχουν "Τρόμου").
  useEffect(() => {
    let alive = true;
    setGenre(null);
    setItems([]);
    setGenresError(false);
    (type === 'movie' ? tmdb.movieGenres(lang) : tmdb.tvGenres(lang))
      .then((res) => alive && setGenres(res.genres || []))
      .catch(() => alive && setGenresError(true));
    return () => { alive = false; };
  }, [type, lang, reloadKey]);

  const load = useCallback(async (pageToLoad, reset) => {
    if (!genre) return;
    setLoading(true);
    try {
      const res = type === 'movie'
        ? await tmdb.discoverMovies({ genres: genre, page: pageToLoad })
        : await tmdb.discoverTV({ genres: genre, page: pageToLoad });
      const mapped = (res.results || []).map((r) => ({ ...r, media_type: type }));
      setItems((prev) => (reset ? mapped : [...prev, ...mapped.filter((m) => !prev.some((p) => p.id === m.id))]));
      setPage(pageToLoad);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      if (reset) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [genre, type]);

  useEffect(() => {
    if (genre) load(1, true);
  }, [genre, load]);

  const openDetail = (item) => navigation.navigate('Detail', { id: item.id, mediaType: item.media_type });

  const header = (
    <View>
      <Text style={[styles.header, { color: theme.text }]}>{t('tabs.browse')}</Text>
      <View style={styles.typeRow}>
        <GenreChip label={t('browse.type_movie')} selected={type === 'movie'} onPress={() => setType('movie')} />
        <GenreChip label={t('browse.type_tv')} selected={type === 'tv'} onPress={() => setType('tv')} />
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('browse.pick_genre')}</Text>
      {genresError ? (
        <Pressable onPress={() => setReloadKey((k) => k + 1)} style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: theme.textSecondary }}>{t('browse.genres_error')} {t('common.retry')}</Text>
        </Pressable>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
          {genres.map((g) => (
            <GenreChip key={g.id} label={g.name} selected={genre === g.id} onPress={() => setGenre(g.id)} />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        key="grid"
        numColumns={3}
        keyExtractor={(i) => `${i.media_type}-${i.id}`}
        ListHeaderComponent={header}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <MovieCard item={item} onPress={openDetail} width="100%" />
          </View>
        )}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!loading && genre && page < totalPages) load(page + 1, false);
        }}
        ListEmptyComponent={
          loading ? null : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              {genre ? t('browse.no_results') : t('browse.prompt')}
            </Text>
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator color={theme.primary} style={{ margin: 20 }} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 24, fontWeight: '800', paddingHorizontal: 16, paddingTop: 10 },
  typeRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },
  genreRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
  cell: { flex: 1 / 3, paddingRight: 0 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24 } });

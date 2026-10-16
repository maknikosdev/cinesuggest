import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';
import { tmdb } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import GenreChip from '../components/GenreChip';

export default function CinemaScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const locale = i18n.language?.startsWith('el') ? 'el-GR' : 'en-GB';

  const [mode, setMode] = useState('now'); // now | soon
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (pageToLoad, reset) => {
    setLoading(true);
    setError(false);
    try {
      const res = mode === 'now' ? await tmdb.nowPlaying(pageToLoad) : await tmdb.upcoming(pageToLoad);
      const mapped = (res.results || []).map((r) => ({ ...r, media_type: 'movie' }));
      setItems((prev) => (reset ? mapped : [...prev, ...mapped.filter((m) => !prev.some((p) => p.id === m.id))]));
      setPage(pageToLoad);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      if (reset) setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    setItems([]);
    load(1, true);
  }, [load]);

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const header = (
    <View>
      <Text style={[styles.header, { color: theme.text }]}>{t('tabs.cinema')}</Text>
      <View style={styles.typeRow}>
        <GenreChip label={t('cinema.now_playing')} selected={mode === 'now'} onPress={() => setMode('now')} />
        <GenreChip label={t('cinema.upcoming')} selected={mode === 'soon'} onPress={() => setMode('soon')} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        key="grid"
        numColumns={3}
        keyExtractor={(i) => `${i.id}`}
        ListHeaderComponent={header}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <MovieCard
              item={item}
              width="100%"
              subtitle={mode === 'soon' ? formatDate(item.release_date) : null}
              onPress={() => navigation.navigate('Detail', { id: item.id, mediaType: 'movie' })}
            />
          </View>
        )}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!loading && page < totalPages) load(page + 1, false);
        }}
        ListEmptyComponent={
          loading ? null : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              {error ? t('common.error') : t('browse.no_results')}
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
  typeRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, marginBottom: 14, gap: 8 },
  cell: { flex: 1 / 3 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24 } });

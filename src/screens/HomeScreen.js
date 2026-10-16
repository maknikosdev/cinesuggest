import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { tmdb } from '../api/tmdb';
import { toTvGenreParam } from '../constants/catalog';
import Carousel from '../components/Carousel';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { favoriteGenres } = useApp();

  const [trending, setTrending] = useState([]);
  const [topSeries, setTopSeries] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);

  // Τα αγαπημένα είδη του onboarding είναι IDs ταινιών· οι σειρές στο TMDB
  // έχουν άλλα IDs, οπότε τα μετατρέπουμε (και με OR, όχι AND).
  const tvGenres = toTvGenreParam(favoriteGenres);

  const load = useCallback(async () => {
    setLoadingTrending(true);
    setLoadingSeries(true);
    try {
      const trendRes = await tmdb.trending('all', 'week');
      setTrending((trendRes.results || []).filter((r) => r.media_type !== 'person'));
    } catch (e) {
      setTrending([]);
    } finally {
      setLoadingTrending(false);
    }
    try {
      const seriesRes = await tmdb.discoverTV({ genres: tvGenres });
      setTopSeries((seriesRes.results || []).map((r) => ({ ...r, media_type: 'tv' })));
    } catch (e) {
      setTopSeries([]);
    } finally {
      setLoadingSeries(false);
    }
  }, [tvGenres]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (item) => {
    navigation.navigate('Detail', {
      id: item.id,
      mediaType: item.media_type || (item.title ? 'movie' : 'tv') });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.text }]}>{t('home.greeting')}</Text>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('SearchTab')}
          style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>{t('search.placeholder')}</Text>
        </Pressable>

        <Carousel title={t('home.trending')} data={trending} loading={loadingTrending} onItemPress={openDetail} />
        <Carousel title={t('home.top_series')} data={topSeries} loading={loadingSeries} onItemPress={openDetail} />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10 },
  greeting: { flex: 1, fontSize: 20, fontWeight: '800', marginRight: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1 } });

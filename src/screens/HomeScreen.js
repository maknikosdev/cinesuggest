import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { tmdb } from '../api/tmdb';
import Carousel from '../components/Carousel';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { favoriteGenres } = useApp();

  const [trending, setTrending] = useState([]);
  const [topSeries, setTopSeries] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);

  const genresCsv = favoriteGenres.join(',') || undefined;

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
      const seriesRes = await tmdb.discoverTV({ genres: genresCsv });
      setTopSeries((seriesRes.results || []).map((r) => ({ ...r, media_type: 'tv' })));
    } catch (e) {
      setTopSeries([]);
    } finally {
      setLoadingSeries(false);
    }
  }, [genresCsv]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (item) => {
    navigation.navigate('Detail', {
      id: item.id,
      mediaType: item.media_type || (item.title ? 'movie' : 'tv') });
  };

  const runQuickPick = (mode) => {
    navigation.navigate('QuickPickResults', { mode, genres: genresCsv });
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

        <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 16 }]}>
          {t('home.quick_pick')}
        </Text>
        <View style={styles.quickRow}>
          <QuickButton icon="🍿" label={t('home.one_hour')} onPress={() => runQuickPick('short')} theme={theme} />
          <QuickButton icon="🎭" label={t('home.want_laugh')} onPress={() => runQuickPick('comedy')} theme={theme} />
          <QuickButton icon="😱" label={t('home.on_edge')} onPress={() => runQuickPick('thriller')} theme={theme} />
          <QuickButton icon="🎲" label={t('home.roll_dice')} onPress={() => runQuickPick('random')} theme={theme} />
        </View>

        <Carousel title={t('home.trending')} data={trending} loading={loadingTrending} onItemPress={openDetail} />
        <Carousel title={t('home.top_series')} data={topSeries} loading={loadingSeries} onItemPress={openDetail} />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickButton({ icon, label, onPress, theme }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.quickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[styles.quickLabel, { color: theme.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
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
    borderWidth: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  quickRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4 },
  quickLabel: { fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center' } });

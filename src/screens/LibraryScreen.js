import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import GenreChip from '../components/GenreChip';

export default function LibraryScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { fetchWatchlist } = useApp();

  const [tab, setTab] = useState('PLAN_TO_WATCH');
  const [sortBy, setSortBy] = useState('recent');
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const rows = await fetchWatchlist(tab, sortBy);
    setItems(
      rows.map((r) => ({
        id: r.media_id,
        media_type: r.media_type,
        title: r.title,
        poster_path: r.poster_path,
        vote_average: r.vote_average,
      }))
    );
  }, [tab, sortBy, fetchWatchlist]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openDetail = (item) => {
    navigation.navigate('Detail', { id: item.id, mediaType: item.media_type });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>{t('tabs.library')}</Text>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab('PLAN_TO_WATCH')}
          style={[
            styles.tabBtn,
            { borderColor: theme.border },
            tab === 'PLAN_TO_WATCH' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Text style={{ color: tab === 'PLAN_TO_WATCH' ? theme.primaryText : theme.text, fontWeight: '700' }}>
            {t('library.watchlist')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('WATCHED')}
          style={[
            styles.tabBtn,
            { borderColor: theme.border },
            tab === 'WATCHED' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Text style={{ color: tab === 'WATCHED' ? theme.primaryText : theme.text, fontWeight: '700' }}>
            {t('library.watched')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.sortRow}>
        <GenreChip label={t('library.sort_recent')} selected={sortBy === 'recent'} onPress={() => setSortBy('recent')} />
        <GenreChip label={t('library.sort_rating')} selected={sortBy === 'rating'} onPress={() => setSortBy('rating')} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        numColumns={3}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <MovieCard item={item} width={105} onPress={openDetail} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 30 }}>
            {tab === 'PLAN_TO_WATCH' ? t('library.empty_watchlist') : t('library.empty_watched')}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  tabRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 14 },
  tabBtn: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10 },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14 },
});

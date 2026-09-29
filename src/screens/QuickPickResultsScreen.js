import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { tmdb } from '../api/tmdb';
import MovieCard from '../components/MovieCard';

const COMEDY_GENRE = '35';
const THRILLER_GENRES = '53,27';

export default function QuickPickResultsScreen({ route, navigation }) {
  const { mode, genres } = route.params || {};
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let res;
        if (mode === 'short') {
          res = await tmdb.discoverByRuntime(100, genres);
        } else if (mode === 'comedy') {
          res = await tmdb.discoverMovies({ genres: COMEDY_GENRE });
        } else if (mode === 'thriller') {
          res = await tmdb.discoverMovies({ genres: THRILLER_GENRES });
        } else {
          res = await tmdb.discoverMovies({ genres, sortBy: 'popularity.desc' });
        }
        const results = (res.results || []).map((r) => ({ ...r, media_type: r.media_type || 'movie' }));
        // "Ρίξε Ζάρι" -> ανακάτεψε και κράτα λίγα τυχαία
        setItems(mode === 'random' ? shuffle(results).slice(0, 12) : results);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, genres]);

  const title = {
    short: t('home.one_hour'),
    comedy: t('home.want_laugh'),
    thriller: t('home.on_edge'),
    random: t('home.roll_dice') }[mode];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <View style={{ width: 26 }} />
      </View>
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          numColumns={3}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <MovieCard
                item={item}
                width={105}
                onPress={() =>
                  navigation.navigate('Detail', { id: item.id, mediaType: item.media_type })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              {t('search.no_results')}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12 },
  title: { fontSize: 17, fontWeight: '800' } });

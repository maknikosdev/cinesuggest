import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { tmdb } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import GenreChip from '../components/GenreChip';

const GENRE_IDS = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37];
const YEARS = Array.from({ length: 45 }, (_, i) => `${2026 - i}`);

export default function SearchScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [type, setType] = useState('all'); // all | movie | tv
  const [genre, setGenre] = useState(null);
  const [year, setYear] = useState(null);
  const [actorMode, setActorMode] = useState(false);

  const runSearch = async (text = query) => {
    if (!text.trim() && !genre && !year) return;
    setLoading(true);
    setSearched(true);
    try {
      let items = [];
      if (actorMode && text.trim()) {
        const people = await tmdb.searchPerson(text);
        const person = people.results?.[0];
        if (person) {
          const credits = await tmdb.personCredits(person.id);
          items = [...(credits.cast || [])].sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0)
          );
        }
      } else if (text.trim()) {
        const res =
          type === 'movie'
            ? await tmdb.searchMovie(text, 1, year)
            : type === 'tv'
            ? await tmdb.searchTV(text)
            : await tmdb.searchMulti(text);
        items = (res.results || []).map((r) => ({
          ...r,
          media_type: r.media_type || type,
        }));
      } else if (genre || year) {
        const useTv = type === 'tv';
        const res = useTv
          ? await tmdb.discoverTV({ genres: genre, year })
          : await tmdb.discoverMovies({ genres: genre, year });
        items = (res.results || []).map((r) => ({ ...r, media_type: useTv ? 'tv' : 'movie' }));
      }
      // εφαρμογή φίλτρων γένους/έτους πάνω στα αποτελέσματα κειμένου, αν χρειάζεται
      if (text.trim() && genre) {
        items = items.filter((it) => it.genre_ids?.includes(Number(genre)));
      }
      items = items.filter((it) => it.media_type !== 'person' && (it.poster_path || it.title || it.name));
      setResults(items);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    navigation.navigate('Detail', { id: item.id, mediaType });
  };

  const clearFilters = () => {
    setGenre(null);
    setYear(null);
    setType('all');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>{t('tabs.search')}</Text>

      <View style={styles.searchRow}>
        <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={actorMode ? t('search.actor') : t('search.placeholder')}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            onSubmitEditing={() => runSearch()}
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={[styles.filterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="options-outline" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.chipsRow}>
        <GenreChip label={t('search.type_all')} selected={type === 'all'} onPress={() => setType('all')} />
        <GenreChip label={t('search.type_movie')} selected={type === 'movie'} onPress={() => setType('movie')} />
        <GenreChip label={t('search.type_tv')} selected={type === 'tv'} onPress={() => setType('tv')} />
        <GenreChip
          label={t('search.actor')}
          icon="🎬"
          selected={actorMode}
          onPress={() => setActorMode((v) => !v)}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.media_type || 'x'}-${item.id}-${idx}`}
          numColumns={3}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <MovieCard item={item} width={105} onPress={openDetail} />
            </View>
          )}
          ListEmptyComponent={
            searched ? (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 30 }}>
                {t('search.no_results')}
              </Text>
            ) : null
          }
        />
      )}

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('search.filters')}</Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>{t('search.genre')}</Text>
              <View style={styles.wrapRow}>
                {GENRE_IDS.map((g) => (
                  <GenreChip
                    key={g}
                    label={t(`genres.${g}`)}
                    selected={genre === String(g)}
                    onPress={() => setGenre(genre === String(g) ? null : String(g))}
                  />
                ))}
              </View>
              <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 10 }]}>
                {t('search.year')}
              </Text>
              <View style={styles.wrapRow}>
                {YEARS.slice(0, 20).map((y) => (
                  <GenreChip key={y} label={y} selected={year === y} onPress={() => setYear(year === y ? null : y)} />
                ))}
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable onPress={clearFilters} style={[styles.clearBtn, { borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontWeight: '700' }}>{t('search.clear')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setFiltersOpen(false);
                  runSearch();
                }}
                style={[styles.applyBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.primaryText, fontWeight: '800' }}>{t('search.apply')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingTop: 8 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, gap: 10 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 10, marginLeft: 8 },
  filterBtn: { width: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, maxHeight: '75%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  clearBtn: { flex: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', paddingVertical: 12 },
  applyBtn: { flex: 2, borderRadius: 14, alignItems: 'center', paddingVertical: 12 },
});

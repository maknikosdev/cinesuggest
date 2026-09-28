import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { tmdb, posterUrl } from '../api/tmdb';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

export default function SwipeScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { favoriteGenres, addToWatchlist } = useApp();

  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;

  const loadDeck = useCallback(async () => {
    setLoading(true);
    try {
      const genresCsv = favoriteGenres.join(',') || undefined;
      const res = await tmdb.discoverMovies({ genres: genresCsv, page: Math.ceil(Math.random() * 5) });
      setDeck(res.results || []);
    } catch (e) {
      setDeck([]);
    } finally {
      setLoading(false);
    }
  }, [favoriteGenres]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const item = deck[0];
    if (direction === 'right' && item) {
      addToWatchlist({ ...item, media_type: 'movie' });
    }
    position.setValue({ x: 0, y: 0 });
    setDeck((prev) => prev.slice(1));
  };

  const resetPosition = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
    });
    return { ...position.getLayout(), transform: [{ rotate }] };
  };

  const openDetail = (item) => {
    navigation.navigate('Detail', { id: item.id, mediaType: 'movie' });
  };

  const top = deck[0];
  const next = deck[1];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('swipe.title')}</Text>
      <Text style={[styles.hint, { color: theme.textSecondary }]}>{t('swipe.hint')}</Text>

      <View style={styles.deckArea}>
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : !top ? (
          <View style={styles.emptyBox}>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>
              {t('swipe.empty')}
            </Text>
            <Pressable
              onPress={loadDeck}
              style={[styles.reloadBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: theme.primaryText, fontWeight: '700' }}>{t('swipe.reload')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {next && (
              <View style={[styles.card, styles.cardBehind, { backgroundColor: theme.surface }]}>
                <SwipeCardContent item={next} theme={theme} />
              </View>
            )}
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.card, getCardStyle(), { backgroundColor: theme.surface }]}
            >
              <Pressable onPress={() => openDetail(top)} style={{ flex: 1 }}>
                <SwipeCardContent item={top} theme={theme} />
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>

      {top && (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => forceSwipe('left')}
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons name="close" size={28} color={theme.danger} />
          </Pressable>
          <Pressable
            onPress={() => forceSwipe('right')}
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons name="heart" size={26} color={theme.success} />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function SwipeCardContent({ item, theme }) {
  const poster = posterUrl(item.poster_path, 'w780');
  return (
    <View style={{ flex: 1 }}>
      {poster ? (
        <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, { backgroundColor: theme.surfaceAlt }]} />
      )}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
          {item.title || item.name}
        </Text>
        <Text style={{ color: theme.textSecondary }}>⭐ {(item.vote_average ?? 0).toFixed(1)}</Text>
      </View>
    </View>
  );
}

const CARD_W = SCREEN_W - 48;
const CARD_H = CARD_W * 1.45;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  hint: { fontSize: 12.5, marginTop: 4, marginBottom: 10, textAlign: 'center', paddingHorizontal: 30 },
  deckArea: { width: CARD_W, height: CARD_H, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardBehind: { top: 8, transform: [{ scale: 0.96 }] },
  poster: { width: '100%', height: '78%' },
  cardInfo: { flex: 1, padding: 14, justifyContent: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  emptyBox: { alignItems: 'center', paddingHorizontal: 30 },
  reloadBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  actionsRow: { flexDirection: 'row', gap: 30, marginTop: 20 },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

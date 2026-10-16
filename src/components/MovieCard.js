import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { posterUrl } from '../api/tmdb';
import { useAppTheme } from '../theme/ThemeContext';

export default function MovieCard({ item, onPress, width = 130, subtitle }) {
  const { theme } = useAppTheme();
  const title = item.title || item.name;
  const poster = posterUrl(item.poster_path || item.poster);
  const rating = (item.vote_average ?? 0).toFixed(1);
  const showRating = (item.vote_average ?? 0) > 0;

  return (
    <Pressable onPress={() => onPress?.(item)} style={[styles.container, { width }]}>
      <View style={[styles.posterWrap, { backgroundColor: theme.surfaceAlt }]}>
        {poster ? (
          <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={[styles.poster, styles.noPoster]}>
            <Ionicons name="film-outline" size={28} color={theme.textSecondary} />
          </View>
        )}
        {showRating && (
          <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="star" size={10} color={theme.primaryText} />
            <Text style={[styles.ratingText, { color: theme.primaryText }]}>{rating}</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
      {!!subtitle && (
        <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 12 },
  posterWrap: { borderRadius: 14, overflow: 'hidden', aspectRatio: 2 / 3 },
  poster: { width: '100%', height: '100%' },
  noPoster: { alignItems: 'center', justifyContent: 'center' },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  ratingText: { fontSize: 11, fontWeight: '700' },
  subtitle: { fontSize: 11, marginTop: 2 },
  title: { marginTop: 6, fontSize: 13, fontWeight: '600' },
});

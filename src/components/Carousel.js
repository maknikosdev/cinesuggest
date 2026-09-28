import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import MovieCard from './MovieCard';
import { useAppTheme } from '../theme/ThemeContext';

export default function Carousel({ title, data, loading, onItemPress }) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.section}>
      {!!title && <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>}
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => `${item.media_type || 'm'}-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => <MovieCard item={item} onPress={onItemPress} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10, paddingHorizontal: 16 },
});

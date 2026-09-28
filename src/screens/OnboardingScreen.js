import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import GenreChip from '../components/GenreChip';

const GENRES = [
  { id: 28, icon: '💥' }, { id: 35, icon: '😂' }, { id: 18, icon: '🎭' },
  { id: 27, icon: '👻' }, { id: 10749, icon: '❤️' }, { id: 878, icon: '🚀' },
  { id: 53, icon: '🔪' }, { id: 16, icon: '🎨' }, { id: 9648, icon: '🕵️' },
  { id: 12, icon: '🗺️' }, { id: 14, icon: '🧙' }, { id: 99, icon: '🎥' },
];

const PROVIDERS = [
  { id: 8, name: 'Netflix' }, { id: 337, name: 'Disney+' },
  { id: 119, name: 'Prime Video' }, { id: 350, name: 'Apple TV+' },
  { id: 2100, name: 'ERTFLIX' }, { id: 1899, name: 'HBO Max' },
];

export default function OnboardingScreen({ onDone }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { savePrefs } = useApp();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);

  const toggleGenre = (id) =>
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const toggleProvider = (id) =>
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const finish = async (skip = false) => {
    await savePrefs(skip ? [] : selectedGenres, skip ? [] : selectedProviders);
    onDone?.();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={require('../../assets/logo_full.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.title')}</Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('onboarding.genres_title')}
        </Text>
        <View style={styles.chipsWrap}>
          {GENRES.map((g) => (
            <GenreChip
              key={g.id}
              icon={g.icon}
              label={t(`genres.${g.id}`)}
              selected={selectedGenres.includes(g.id)}
              onPress={() => toggleGenre(g.id)}
            />
          ))}
        </View>

        <Text style={[styles.subtitle, { color: theme.textSecondary, marginTop: 20 }]}>
          {t('onboarding.providers_title')}
        </Text>
        <View style={styles.chipsWrap}>
          {PROVIDERS.map((p) => (
            <GenreChip
              key={p.id}
              label={p.name}
              selected={selectedProviders.includes(p.id)}
              onPress={() => toggleProvider(p.id)}
            />
          ))}
        </View>

        <Pressable
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={() => finish(false)}
        >
          <Text style={[styles.saveBtnText, { color: theme.primaryText }]}>
            {t('onboarding.save')}
          </Text>
        </Pressable>
        <Pressable onPress={() => finish(true)} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary }}>{t('onboarding.skip')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 21, fontWeight: '800', textAlign: 'center', marginBottom: 22 },
  subtitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  saveBtn: { marginTop: 30, paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
});

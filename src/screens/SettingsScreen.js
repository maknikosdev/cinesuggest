import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { setAppLanguage } from '../i18n';

export default function SettingsScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { theme, modePreference, setMode } = useAppTheme();

  const changeLang = async (lang) => {
    await setAppLanguage(lang);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.header, { color: theme.text }]}>{t('settings.title')}</Text>

        <Section title={t('settings.appearance')} theme={theme}>
          <View style={styles.row}>
            <OptionPill
              label={t('settings.light')}
              active={modePreference === 'light'}
              onPress={() => setMode('light')}
              theme={theme}
              icon="sunny-outline"
            />
            <OptionPill
              label={t('settings.dark')}
              active={modePreference === 'dark'}
              onPress={() => setMode('dark')}
              theme={theme}
              icon="moon-outline"
            />
            <OptionPill
              label={t('settings.system')}
              active={modePreference === 'system'}
              onPress={() => setMode('system')}
              theme={theme}
              icon="phone-portrait-outline"
            />
          </View>
        </Section>

        <Section title={t('settings.language')} theme={theme}>
          <View style={styles.row}>
            <OptionPill label="Ελληνικά" active={i18n.language === 'el'} onPress={() => changeLang('el')} theme={theme} />
            <OptionPill label="English" active={i18n.language === 'en'} onPress={() => changeLang('en')} theme={theme} />
          </View>
        </Section>

        <Section title={t('settings.about')} theme={theme}>
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Image source={require('../../assets/logo_full.png')} style={{ width: 110, height: 110 }} resizeMode="contain" />
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16, marginTop: 8 }}>CineSuggest</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 2 }}>{t('tagline')}</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>v1.0.0 · TMDB API</Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, theme }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function OptionPill({ label, active, onPress, theme, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: theme.border },
        active && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}
    >
      {icon && <Ionicons name={icon} size={15} color={active ? theme.primaryText : theme.text} style={{ marginRight: 5 }} />}
      <Text style={{ color: active ? theme.primaryText : theme.text, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 12.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
});

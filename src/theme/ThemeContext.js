import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './colors';

const THEME_KEY = 'cinesuggest_theme_mode'; // 'light' | 'dark' | 'system'
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme();
  const [modePreference, setModePreference] = useState('system');
  const [resolvedMode, setResolvedMode] = useState(systemScheme || 'light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) setModePreference(saved);
      } finally {
        setLoaded(true);
      }
    })();
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setResolvedMode((prev) => (modePreference === 'system' ? colorScheme || 'light' : prev));
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modePreference === 'system') {
      setResolvedMode(Appearance.getColorScheme() || 'light');
    } else {
      setResolvedMode(modePreference);
    }
  }, [modePreference]);

  const setMode = async (mode) => {
    setModePreference(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  };

  const toggle = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const theme = useMemo(() => (resolvedMode === 'dark' ? darkTheme : lightTheme), [resolvedMode]);

  const value = { theme, modePreference, resolvedMode, setMode, toggle, loaded };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider');
  return ctx;
}

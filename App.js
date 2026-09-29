import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import i18n, { loadSavedLanguage } from './src/i18n';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RootNavigator from './src/navigation/RootNavigator';

// Κρατάμε ενεργό το native splash μέχρι να είναι έτοιμη η εφαρμογή
// (i18n φορτωμένο, βάση δεδομένων αρχικοποιημένη), ώστε το logo να
// φαίνεται ολόκληρο χωρίς κενό/λευκή οθόνη ανάμεσα.
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const { theme } = useAppTheme();
  const { ready, onboarded } = useApp();
  const [showInAppSplash, setShowInAppSplash] = useState(true);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadSavedLanguage();
      setI18nReady(true);
      await ExpoSplashScreen.hideAsync().catch(() => {});
    })();
  }, []);

  if (showInAppSplash || !ready || !i18nReady) {
    return <SplashScreen onFinish={() => setShowInAppSplash(false)} />;
  }

  if (!onboarded) {
    return <OnboardingScreen onDone={() => {}} />;
  }

  return (
    <>
      <StatusBar style={theme.statusBar === 'light' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <AppProvider>
              <Gate />
            </AppProvider>
          </ThemeProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

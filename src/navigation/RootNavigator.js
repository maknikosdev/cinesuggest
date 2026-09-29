import React, { useEffect, useRef } from 'react';
import { BackHandler, Alert, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../theme/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DetailScreen from '../screens/DetailScreen';
import QuickPickResultsScreen from '../screens/QuickPickResultsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// Κάθε tab έχει το δικό του stack ώστε το Android back button
// να κάνει φυσιολογικά "pop" μέσα στο stack πριν βγει από την εφαρμογή.
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="QuickPickResults" component={QuickPickResultsScreen} />
      <HomeStack.Screen name="Detail" component={DetailScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
    </HomeStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="Detail" component={DetailScreen} />
    </SearchStack.Navigator>
  );
}

function LibraryStackScreen() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryMain" component={LibraryScreen} />
      <LibraryStack.Screen name="Detail" component={DetailScreen} />
    </LibraryStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

function Tabs() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.border },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            HomeTab: focused ? 'home' : 'home-outline',
            SearchTab: focused ? 'search' : 'search-outline',
            LibraryTab: focused ? 'bookmark' : 'bookmark-outline',
            SettingsTab: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="SearchTab" component={SearchStackScreen} options={{ title: t('tabs.search') }} />
      <Tab.Screen name="LibraryTab" component={LibraryStackScreen} options={{ title: t('tabs.library') }} />
      <Tab.Screen name="SettingsTab" component={SettingsStackScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const navRef = useRef(null);
  const exitPromptShown = useRef(false);

  // Android hardware back button: pop μέσα στο ενεργό stack, αλλιώς
  // ζήτα επιβεβαίωση εξόδου από την εφαρμογή όταν είμαστε στη ρίζα.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const onBackPress = () => {
      const nav = navRef.current;
      if (!nav) return false;
      if (nav.canGoBack()) {
        nav.goBack();
        return true;
      }
      if (!exitPromptShown.current) {
        exitPromptShown.current = true;
        Alert.alert(
          t('common.exit_confirm_title'),
          t('common.exit_confirm_message'),
          [
            { text: t('common.cancel'), style: 'cancel', onPress: () => (exitPromptShown.current = false) },
            {
              text: t('common.yes'),
              style: 'destructive',
              onPress: () => {
                exitPromptShown.current = false;
                BackHandler.exitApp();
              },
            },
          ],
          { cancelable: true, onDismiss: () => (exitPromptShown.current = false) }
        );
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [t]);

  const navTheme = theme.mode === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.background, card: theme.surface, border: theme.border, text: theme.text, primary: theme.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.background, card: theme.surface, border: theme.border, text: theme.text, primary: theme.primary } };

  return (
    <NavigationContainer ref={navRef} theme={navTheme}>
      <Tabs />
    </NavigationContainer>
  );
}

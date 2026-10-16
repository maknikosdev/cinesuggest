import React, { useEffect, useRef } from 'react';
import { BackHandler, Alert, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../theme/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import CinemaScreen from '../screens/CinemaScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DetailScreen from '../screens/DetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BrowseStack = createNativeStackNavigator();
const CinemaStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();

// Κάθε tab έχει το δικό του stack ώστε το Android back button
// να κάνει φυσιολογικά "pop" μέσα στο stack πριν βγει από την εφαρμογή.
// Οι Ρυθμίσεις ανοίγουν από το εικονίδιο γραναζιού της Αρχικής.
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Detail" component={DetailScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
    </HomeStack.Navigator>
  );
}

function BrowseStackScreen() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerShown: false }}>
      <BrowseStack.Screen name="BrowseMain" component={BrowseScreen} />
      <BrowseStack.Screen name="Detail" component={DetailScreen} />
    </BrowseStack.Navigator>
  );
}

function CinemaStackScreen() {
  return (
    <CinemaStack.Navigator screenOptions={{ headerShown: false }}>
      <CinemaStack.Screen name="CinemaMain" component={CinemaScreen} />
      <CinemaStack.Screen name="Detail" component={DetailScreen} />
    </CinemaStack.Navigator>
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
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            HomeTab: focused ? 'home' : 'home-outline',
            BrowseTab: focused ? 'grid' : 'grid-outline',
            CinemaTab: focused ? 'film' : 'film-outline',
            SearchTab: focused ? 'search' : 'search-outline',
            LibraryTab: focused ? 'bookmark' : 'bookmark-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="BrowseTab" component={BrowseStackScreen} options={{ title: t('tabs.browse') }} />
      <Tab.Screen name="CinemaTab" component={CinemaStackScreen} options={{ title: t('tabs.cinema') }} />
      <Tab.Screen name="SearchTab" component={SearchStackScreen} options={{ title: t('tabs.search') }} />
      <Tab.Screen name="LibraryTab" component={LibraryStackScreen} options={{ title: t('tabs.library') }} />
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

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { brand } from '../theme/colors';

const MIN_SPLASH_MS = 1200; // τουλάχιστον 1 δευτερόλεπτο εμφάνισης του logo

export default function SplashScreen({ onFinish }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        onFinish?.();
      });
    }, MIN_SPLASH_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
        {/* Το πλήρες logo, όχι περικομμένο σε κύκλο */}
        <Image
          source={require('../../assets/logo_full.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
});

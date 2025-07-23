import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { UnitContext } from '../context/UnitContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return null;
  }

  if (showSplash) {
    return (
      <LottieView
        source={require('../assets/images/weather-loading-animation.json')}
        autoPlay
        loop={false}
        style={{ flex: 1, backgroundColor: '#232526' }}
      />
    );
  }

  return (
    <UnitContext.Provider value={{ unit, setUnit }}>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </UnitContext.Provider>
  );
}

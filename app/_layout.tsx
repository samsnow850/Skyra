import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from '../components/Onboarding';
import { ThemeProvider as ContextThemeProvider } from '../context/ThemeContext';
import { UnitContext } from '../context/UnitContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      const complete = await AsyncStorage.getItem('onboardingComplete');
      setShowOnboarding(complete !== 'true');
    };
    if (!showSplash && showOnboarding === null) {
      checkOnboarding();
    }
  }, [showSplash, showOnboarding]);

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

  if (showOnboarding) {
    return <Onboarding onFinish={() => setShowOnboarding(false)} />;
  }

  return (
    <UnitContext.Provider value={{ unit, setUnit }}>
      <ContextThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ContextThemeProvider>
    </UnitContext.Provider>
  );
}

import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from '../components/Onboarding';
import { ThemeProvider as ContextThemeProvider } from '../context/ThemeContext';
import { UnitContext } from '../context/UnitContext';
import { supabase } from '../utils/supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [unit, setUnit] = useState<'C' | 'F'>('F');
  const [windUnit, setWindUnit] = useState<'mph' | 'kph'>('mph');
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [postOnboardingRoute, setPostOnboardingRoute] = useState<string | null>(null);

  // Load user preferences from Supabase when app starts
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('temp_unit, wind_unit')
            .eq('id', user.id)
            .single();
          
          if (data) {
            if (data.temp_unit && (data.temp_unit === 'C' || data.temp_unit === 'F')) {
              setUnit(data.temp_unit);
            }
            if (data.wind_unit && (data.wind_unit === 'mph' || data.wind_unit === 'kph')) {
              setWindUnit(data.wind_unit);
            }
          }
        }
      } catch (error) {
        console.log('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

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

  // Handle post-onboarding navigation
  useEffect(() => {
    if (postOnboardingRoute && !showOnboarding) {
      router.replace(postOnboardingRoute);
      setPostOnboardingRoute(null);
    }
  }, [postOnboardingRoute, showOnboarding]);

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
    return (
      <Onboarding 
        onFinish={() => setShowOnboarding(false)} 
        onNavigateToAuth={(route: string) => {
          setPostOnboardingRoute(route);
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <UnitContext.Provider value={{ unit, setUnit, windUnit, setWindUnit }}>
        <ContextThemeProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ContextThemeProvider>
      </UnitContext.Provider>
    </SafeAreaProvider>
  );
}

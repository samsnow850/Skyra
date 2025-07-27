import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { supabase } from '../utils/supabase';

const LIGHT = {
  mode: 'light',
  backgroundGradient: ['#f6f7fb', '#e9ecf3'],
  card: '#ffffff',
  text: '#232526',
  accent: '#667eea',
  border: '#e0e3eb',
  error: '#ff6b6b',
};

const DARK = {
  mode: 'dark',
  backgroundGradient: ['#232526', '#2c2f38'],
  card: '#2c2f38',
  text: '#f6f7fb',
  accent: '#667eea',
  border: '#353945',
  error: '#ff6b6b',
};

const ThemeContext = createContext({
  theme: LIGHT,
  themeName: 'light',
  setThemeName: (name: 'light' | 'dark' | 'system') => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<'light' | 'dark' | 'system'>('system');
  const [theme, setTheme] = useState(LIGHT);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // Load theme preference from Supabase or AsyncStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      if (user) {
        // Load from Supabase if user is logged in
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('theme')
            .eq('id', user.id)
            .single();
          
          if (data && data.theme && (data.theme === 'light' || data.theme === 'dark' || data.theme === 'system')) {
            setThemeName(data.theme);
          }
        } catch (error) {
          console.log('Error loading theme from Supabase:', error);
          // Fallback to AsyncStorage
          const stored = await AsyncStorage.getItem('theme');
          if (stored === 'light' || stored === 'dark' || stored === 'system') {
            setThemeName(stored);
          }
        }
      } else {
        // Load from AsyncStorage if not logged in
        const stored = await AsyncStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeName(stored);
        }
      }
    };

    loadThemePreference();
  }, [user]);

  // Save theme preference to Supabase or AsyncStorage
  const saveThemePreference = async (newThemeName: 'light' | 'dark' | 'system') => {
    if (user) {
      // Save to Supabase if user is logged in
      try {
        await supabase
          .from('user_preferences')
          .upsert({
            id: user.id,
            theme: newThemeName
          });
      } catch (error) {
        console.log('Error saving theme to Supabase:', error);
        // Fallback to AsyncStorage
        await AsyncStorage.setItem('theme', newThemeName);
      }
    } else {
      // Save to AsyncStorage if not logged in
      await AsyncStorage.setItem('theme', newThemeName);
    }
  };

  useEffect(() => {
    const getScheme = () => {
      if (themeName === 'system') {
        const sys: ColorSchemeName = Appearance.getColorScheme();
        return sys === 'dark' ? DARK : LIGHT;
      }
      return themeName === 'dark' ? DARK : LIGHT;
    };
    setTheme(getScheme());
    saveThemePreference(themeName);
  }, [themeName, user]);

  useEffect(() => {
    if (themeName === 'system') {
      const sub = Appearance.addChangeListener(() => {
        setTheme(Appearance.getColorScheme() === 'dark' ? DARK : LIGHT);
      });
      return () => sub.remove();
    }
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

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

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeName(stored);
      }
    })();
  }, []);

  useEffect(() => {
    const getScheme = () => {
      if (themeName === 'system') {
        const sys: ColorSchemeName = Appearance.getColorScheme();
        return sys === 'dark' ? DARK : LIGHT;
      }
      return themeName === 'dark' ? DARK : LIGHT;
    };
    setTheme(getScheme());
    AsyncStorage.setItem('theme', themeName);
  }, [themeName]);

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
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabBarBackground() {
  const { theme } = useTheme();
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.card }]} />;
}

export function useBottomTabOverflow() {
  return 0;
}

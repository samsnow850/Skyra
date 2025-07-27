import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const SignupSuccessScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundGradient[0], justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.card, { backgroundColor: theme.card }]}> 
        <View style={styles.iconWrap}>
          <Ionicons name="mail-unread" size={48} color={theme.accent} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Check your email!</Text>
        <Text style={[styles.subtitle, { color: theme.text + '99' }]}>We've sent a confirmation link to your email address. Please confirm your account to continue.</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={() => router.replace('/auth/login')}>
          <Text style={[styles.buttonText, { color: theme.card }]}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWrap: {
    backgroundColor: '#e3e8ff',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupSuccessScreen; 
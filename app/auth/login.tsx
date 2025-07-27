import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../utils/supabase';
import { Stack } from 'expo-router';

const LoginScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const welcomeAnim = useRef(new Animated.Value(-100)).current;

  const showWelcomeNotification = (name: string) => {
    setUserName(name);
    setWelcomeVisible(true);
    
    Animated.spring(welcomeAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      hideWelcomeNotification();
    }, 3000);
  };

  const hideWelcomeNotification = () => {
    Animated.spring(welcomeAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setWelcomeVisible(false);
    });
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    } else {
      // Get user's name from metadata
      const name = data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'User';
      showWelcomeNotification(name);
      
      // Navigate after a short delay to show the welcome message
      setTimeout(() => {
        router.replace('/');
      }, 500);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
        {/* Welcome Back Notification */}
        {welcomeVisible && (
          <Animated.View
            style={[
              styles.welcomeNotification,
              {
                backgroundColor: theme.accent,
                transform: [{ translateY: welcomeAnim }],
              },
            ]}
          >
            <View style={styles.welcomeContent}>
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text style={styles.welcomeText}>
                Welcome back, {userName}! 👋
              </Text>
            </View>
            <TouchableOpacity onPress={hideWelcomeNotification} style={styles.welcomeClose}>
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        )}
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
        <TouchableOpacity
          style={{ position: 'absolute', top: 48, left: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color={theme.accent} />
          <Text style={{ color: theme.accent, fontSize: 16, marginLeft: 4, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={[styles.card, { backgroundColor: theme.card }]}> 
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark" size={48} color={theme.accent} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Hello.</Text>
            <Text style={[styles.subtitle, { color: theme.text + '99' }]}>Sign in to your account</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { borderColor: theme.accent + '60', color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.text + '60'}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={[styles.input, { borderColor: theme.accent + '60', color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.text + '60'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin} disabled={loading}>
              <Text style={[styles.buttonText, { color: theme.card }]}>{loading ? 'Loading...' : 'Log in'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.outlineButton, { borderColor: theme.accent }]} onPress={() => router.push('/auth/signup')}>
              <Text style={[styles.buttonText, { color: theme.accent }]}>Create an account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.push('/auth/forgot')}>
              <Text style={[styles.link, { color: theme.accent }]}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.8,
  },
  inputWrap: {
    width: '100%',
    marginBottom: 18,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  error: {
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  welcomeNotification: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 60 : 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeClose: {
    padding: 4,
  },
});

export default LoginScreen; 
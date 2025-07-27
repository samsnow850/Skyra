import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

const SignupScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) setError(error.message);
    else { router.replace('/signup-success'); }
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
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
            <Text style={[styles.title, { color: theme.text }]}>Welcome.</Text>
            <Text style={[styles.subtitle, { color: theme.text + '99' }]}>Create your account</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { borderColor: theme.accent + '60', color: theme.text }]}
                placeholder="Name"
                placeholderTextColor={theme.text + '60'}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
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
            {message ? <Text style={[styles.error, { color: theme.accent }]}>{message}</Text> : null}
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSignup} disabled={loading}>
              <Text style={[styles.buttonText, { color: theme.card }]}>{loading ? 'Loading...' : 'Next'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => router.replace('/auth/login')}>
              <Text style={[styles.link, { color: theme.accent }]}>I already have an account! Log in</Text>
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
});

export default SignupScreen; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../utils/supabase';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) setError(error.message);
      setUser(data?.user ?? null);
      setDisplayName(data?.user?.user_metadata?.name || '');
      setEmail(data?.user?.email || '');
      setLoading(false);
    });
  }, []);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setError('');
    let message = '';
    const updates: any = {};
    if (displayName !== user?.user_metadata?.name) updates.data = { name: displayName };
    if (email !== user?.email) updates.email = email;
    if (Object.keys(updates).length > 0) {
      const { error, data } = await supabase.auth.updateUser(updates);
      if (error) setError(error.message);
      else {
        if (updates.email) message = 'Check your new email to confirm the change.';
        else message = 'Profile updated!';
        alert(message);
      }
    }
    setUpdating(false);
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    // Show confirmation dialog
    const confirmed = window.confirm
      ? window.confirm('Are you sure you want to send a password reset email?')
      : await new Promise(resolve => {
          // For React Native, use Alert
          import('react-native').then(({ Alert }) => {
            Alert.alert(
              'Reset Password',
              'Are you sure you want to send a password reset email?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'OK', onPress: () => resolve(true) },
              ],
              { cancelable: true }
            );
          });
        });
    if (!confirmed) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) setError(error.message);
    else alert('Password reset email sent!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#181A20', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#181A20' }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 }} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={40} color={theme.accent} />
            </View>
            <Text style={styles.title}>Account Settings</Text>
            <View style={styles.sectionBox}>
              <View style={styles.sectionRow}>
                <Ionicons name="person-outline" size={20} color="#8A8F98" style={{ marginRight: 8 }} />
                <Text style={styles.sectionLabel}>Account Status</Text>
                <Text style={[styles.sectionValue, { color: user?.email_confirmed_at ? theme.accent : theme.error }]}>{user?.email_confirmed_at ? 'Verified' : 'Unverified'}</Text>
              </View>
            </View>
            <View style={styles.sectionBox}>
              <View style={styles.sectionRow}>
                <Ionicons name="mail-outline" size={20} color="#8A8F98" style={{ marginRight: 8 }} />
                <Text style={styles.sectionLabel}>Member Since</Text>
                <Text style={styles.sectionValue}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.inputLabel}>Display Name</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor="#8A8F98"
                autoCapitalize="words"
              />
            </View>
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Email Address</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#8A8F98"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <LinearGradient
              colors={[theme.accent, '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity style={{ width: '100%' }} onPress={handleUpdateProfile} disabled={updating}>
                <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Profile'}</Text>
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.resetBox} onPress={handleResetPassword}>
              <Ionicons name="lock-closed-outline" size={20} color="#8A8F98" style={{ marginRight: 8 }} />
              <Text style={styles.resetText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            {error ? <Text style={{ color: theme.error, marginTop: 12 }}>{error}</Text> : null}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={{ position: 'absolute', top: 48, left: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color={theme.accent} />
          <Text style={{ color: theme.accent, fontSize: 16, marginLeft: 4, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#23262F',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
    marginTop: 48, // Add more top margin
  },
  iconCircle: {
    backgroundColor: '#3b82f6' + '22',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 0, // Remove negative margin so it sits inside the card
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 28,
    color: '#fff',
    textAlign: 'center',
  },
  sectionBox: {
    width: '100%',
    backgroundColor: '#262A34',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8A8F98',
    flex: 1,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2c2f38',
    marginVertical: 18,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8A8F98',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  inputBox: {
    width: '100%',
    backgroundColor: '#23262F',
    borderRadius: 10,
    marginBottom: 0,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  gradientButton: {
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 14,
    color: '#fff',
    textAlign: 'center',
  },
  resetBox: {
    width: '100%',
    backgroundColor: '#23262F',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2c2f38',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  signOutButton: {
    width: '100%',
    borderRadius: 10,
    marginTop: 0,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#E53935',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
}); 
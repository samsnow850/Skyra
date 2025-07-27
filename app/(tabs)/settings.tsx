import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import React, { FC, useEffect, useState, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';
import { supabase } from '../../utils/supabase';

const { width } = Dimensions.get('window');

type AuthModalProps = {
  visible: boolean;
  onClose: () => void;
  onAuthChange: () => void;
  theme: any;
};

const AuthModal: FC<AuthModalProps> = ({ visible, onClose, onAuthChange, theme }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogin = async () => {
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message); else { setMessage('Logged in!'); onAuthChange(); onClose(); }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message); else { setMessage('Check your email to confirm!'); setView('login'); }
    setLoading(false);
  };

  const handleForgot = async () => {
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message); else setMessage('Password reset email sent!');
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}> 
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.authModalContainer}>
          <View style={[styles.authModalContent, { backgroundColor: theme.card, alignItems: 'center', padding: 32, borderRadius: 28, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 16, width: '92%', maxWidth: 420 }]}> 
            <TouchableOpacity onPress={onClose} style={[styles.authCloseButton, { backgroundColor: theme.error + '10', top: 18, right: 18, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'absolute', zIndex: 2 }]}>
              <Ionicons name="close" size={28} color={theme.error} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
              <View style={{ backgroundColor: theme.accent + '22', borderRadius: 40, width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons 
                  name={view === 'login' ? 'person-circle' : view === 'signup' ? 'person-add' : 'key'} 
                  size={48} 
                  color={theme.accent} 
                />
              </View>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>
                {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
              </Text>
              <Text style={{ fontSize: 16, color: theme.text + '99', textAlign: 'center', marginBottom: 2 }}>
                {view === 'login' ? 'Access your Skyra account' : view === 'signup' ? 'Join Skyra today' : 'We’ll send you a reset link'}
              </Text>
            </View>
            <View style={{ width: '100%' }}>
              <View style={[styles.inputContainer, { backgroundColor: theme.border + '30', borderRadius: 12, marginBottom: 16, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center' }]}> 
                <Ionicons name="mail" size={22} color={theme.accent} style={{ marginLeft: 16, marginRight: 8 }} />
                <TextInput
                  style={[styles.authInput, { backgroundColor: 'transparent', color: theme.text, borderColor: 'transparent', flex: 1, paddingLeft: 0 }]}
                  placeholder="Email address"
                  placeholderTextColor={theme.text + '60'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {view !== 'forgot' && (
                <View style={[styles.inputContainer, { backgroundColor: theme.border + '30', borderRadius: 12, marginBottom: 16, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center' }]}> 
                  <Ionicons name="lock-closed" size={22} color={theme.accent} style={{ marginLeft: 16, marginRight: 8 }} />
                  <TextInput
                    style={[styles.authInput, { backgroundColor: 'transparent', color: theme.text, borderColor: 'transparent', flex: 1, paddingLeft: 0 }]}
                    placeholder="Password"
                    placeholderTextColor={theme.text + '60'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              )}
              {error ? (
                <View style={[styles.messageContainer, { backgroundColor: theme.error + '10', borderRadius: 8, marginBottom: 8 }]}> 
                  <Ionicons name="alert-circle" size={18} color={theme.error} />
                  <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                </View>
              ) : null}
              {message ? (
                <View style={[styles.messageContainer, { backgroundColor: theme.accent + '10', borderRadius: 8, marginBottom: 8 }]}> 
                  <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
                  <Text style={[styles.successText, { color: theme.accent }]}>{message}</Text>
                </View>
              ) : null}
              <TouchableOpacity 
                style={[styles.authButton, { backgroundColor: theme.accent, borderRadius: 12, marginTop: 8, marginBottom: 8 }]} 
                onPress={view === 'login' ? handleLogin : view === 'signup' ? handleSignUp : handleForgot} 
                disabled={loading}
              >
                {loading ? (
                  <Animated.View style={styles.loadingContainer}>
                    <Text style={[styles.authButtonText, { color: theme.card }]}>Loading...</Text>
                  </Animated.View>
                ) : (
                  <Text style={[styles.authButtonText, { color: theme.card }]}>
                    {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={[styles.authFooter, { marginTop: 8 }]}> 
                {view === 'login' && (
                  <>
                    <TouchableOpacity onPress={() => setView('forgot')} style={styles.linkButton}>
                      <Text style={[styles.linkText, { color: theme.accent }]}>Forgot your password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setView('signup')} style={styles.linkButton}>
                      <Text style={[styles.linkText, { color: theme.text + '80' }]}>
                        Don&apos;t have an account? <Text style={{ color: theme.accent }}>Sign up</Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {view === 'signup' && (
                  <TouchableOpacity onPress={() => setView('login')} style={styles.linkButton}>
                    <Text style={[styles.linkText, { color: theme.text + '80' }]}>
                      Already have an account? <Text style={{ color: theme.accent }}>Sign in</Text>
                    </Text>
                  </TouchableOpacity>
                )}
                {view === 'forgot' && (
                  <TouchableOpacity onPress={() => setView('login')} style={styles.linkButton}>
                    <Text style={[styles.linkText, { color: theme.accent }]}>Back to sign in</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

type SettingsCardProps = {
  children: React.ReactNode;
  style?: any;
  theme: any;
};
const SettingsCard: React.FC<SettingsCardProps> = ({ children, style, theme }) => (
  <View style={[styles.enhancedCard, { backgroundColor: theme.card }, style]}>
    {children}
  </View>
);

type SettingsSectionProps = {
  icon: string;
  title: string;
  children: React.ReactNode;
  theme: any;
};
const SettingsSection: React.FC<SettingsSectionProps> = ({ icon, title, children, theme }) => (
  <SettingsCard theme={theme}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: theme.accent + '20' }]}> 
        <Ionicons name={icon as any} size={20} color={theme.accent} />
      </View>
      <Text style={[styles.enhancedCardTitle, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </SettingsCard>
);

type CustomSwitchProps = {
  value: boolean;
  onValueChange: (val: boolean) => void;
  theme: any;
};

const CustomSwitch: React.FC<CustomSwitchProps> = ({ value, onValueChange, theme }) => {
  const switchAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(switchAnim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [value]);

  const translateX = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const backgroundColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border, theme.accent],
  });

  return (
    <Animated.View style={[styles.customSwitch, { backgroundColor }]}>
      <TouchableOpacity
        style={styles.switchTouchable}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            {
              backgroundColor: '#fff',
              transform: [{ translateX }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const { unit, setUnit, windUnit, setWindUnit } = useUnit();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [severeAlertsEnabled, setSevereAlertsEnabled] = useState(true);
  const { theme, themeName, setThemeName } = useTheme();
  const [changelogVisible, setChangelogVisible] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastAnim = useRef(new Animated.Value(-100)).current;

  // Load user preferences from Supabase when user is logged in
  useEffect(() => {
    const loadUserPreferences = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('temp_unit, wind_unit, theme')
          .eq('id', userId)
          .single();
        
        if (data) {
          if (data.temp_unit && (data.temp_unit === 'C' || data.temp_unit === 'F')) {
            setUnit(data.temp_unit);
          }
          if (data.wind_unit && (data.wind_unit === 'mph' || data.wind_unit === 'kph')) {
            setWindUnit(data.wind_unit);
          }
          if (data.theme && (data.theme === 'light' || data.theme === 'dark' || data.theme === 'system')) {
            setThemeName(data.theme);
          }
        } else if (error && error.code === 'PGRST116') {
          // No preferences found, create default preferences
          await supabase.from('user_preferences').insert({
            id: userId,
            temp_unit: 'F',
            wind_unit: 'mph',
            theme: 'system'
          });
        }
      } catch (error) {
        console.log('Error loading user preferences:', error);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserPreferences(session.user.id);
      }
    });

    // Load current user preferences if already logged in
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data?.user ?? null);
      if (data?.user) {
        await loadUserPreferences(data.user.id);
      }
    });

    return () => { listener?.subscription?.unsubscribe?.(); };
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    Animated.spring(toastAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      hideToast();
    }, 3000);
  };

  // Hide toast notification
  const hideToast = () => {
    Animated.spring(toastAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setToastVisible(false);
    });
  };

  // Save temperature unit to Supabase when changed and user is logged in
  const handleSetUnit = async (newUnit: 'C' | 'F') => {
    setUnit(newUnit);
    if (user) {
      try {
        const { data, error } = await supabase.from('user_preferences').upsert({ 
          id: user.id, 
          temp_unit: newUnit,
          wind_unit: windUnit, // Keep existing wind unit
          theme: themeName // Keep existing theme
        });
        
        if (error) {
          console.log('Error saving temperature unit to Supabase:', error);
          showToast('Failed to save changes. Please try again.', 'error');
        } else {
          console.log('✅ Temperature unit saved to Supabase successfully:', newUnit);
          showToast('Changes saved successfully!', 'success');
        }
      } catch (error) {
        console.log('Error saving temperature unit:', error);
        showToast('Network error. Please check your connection.', 'error');
      }
    } else {
      // User not logged in, still show success for local changes
      showToast('Changes saved locally!', 'success');
    }
  };

  // Save wind speed unit to Supabase when changed and user is logged in
  const handleSetWindUnit = async (newWindUnit: 'mph' | 'kph') => {
    setWindUnit(newWindUnit);
    if (user) {
      try {
        const { data, error } = await supabase.from('user_preferences').upsert({ 
          id: user.id, 
          temp_unit: unit, // Keep existing temp unit
          wind_unit: newWindUnit,
          theme: themeName // Keep existing theme
        });
        
        if (error) {
          console.log('Error saving wind unit to Supabase:', error);
          showToast('Failed to save changes. Please try again.', 'error');
        } else {
          console.log('✅ Wind unit saved to Supabase successfully:', newWindUnit);
          showToast('Changes saved successfully!', 'success');
        }
      } catch (error) {
        console.log('Error saving wind unit:', error);
        showToast('Network error. Please check your connection.', 'error');
      }
    } else {
      // User not logged in, still show success for local changes
      showToast('Changes saved locally!', 'success');
    }
  };

  // Save theme to Supabase when changed and user is logged in
  const handleSetTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    setThemeName(newTheme);
    if (user) {
      try {
        const { data, error } = await supabase.from('user_preferences').upsert({ 
          id: user.id, 
          temp_unit: unit, // Keep existing temp unit
          wind_unit: windUnit, // Keep existing wind unit
          theme: newTheme
        });
        
        if (error) {
          console.log('Error saving theme to Supabase:', error);
          showToast('Failed to save changes. Please try again.', 'error');
        } else {
          console.log('✅ Theme saved to Supabase successfully:', newTheme);
          showToast('Theme saved successfully!', 'success');
        }
      } catch (error) {
        console.log('Error saving theme to Supabase:', error);
        showToast('Failed to save changes. Please try again.', 'error');
      }
    } else {
      showToast('Theme saved locally!', 'success');
    }
  };

  // Request notification permissions and send test notification
  const handleTestNotification = async () => {
    try {
      // Check if we're running in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        Alert.alert(
          'Development Build Required',
          'Push notifications require a development build. Please run "expo run:android" or "expo run:ios" instead of using Expo Go.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to test notifications.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Send test notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌤️ Skyra Weather',
          body: 'This is a test notification from Skyra! Your weather app is working perfectly.',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });

      showToast('Test notification sent!', 'success');
    } catch (error) {
      console.error('Error sending test notification:', error);
      showToast('Failed to send test notification. Make sure you\'re using a development build.', 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundGradient[0] }]}> 
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: theme.text + '80' }]}>Customize your Skyra experience</Text>
          </View>

          {/* Enhanced Profile Section */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, alignItems: 'center', padding: 24 }]}> 
            <View style={[styles.profileContent, { flexDirection: 'column', alignItems: 'center', width: '100%' }]}> 
              <View style={[styles.profileIconContainer, { backgroundColor: theme.accent + '20', marginBottom: 12 }]}> 
                <Ionicons 
                  name={user ? 'person' : 'person-add'} 
                  size={32} 
                  color={theme.accent} 
                />
              </View>
              <Text style={[styles.profileTitle, { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }]}> 
                {user ? 'Account' : 'Sign In or Create Account'}
              </Text>
              <Text style={[styles.profileSubtitle, { color: theme.text + '70', textAlign: 'center', marginBottom: 16 }]}> 
                {user?.email || 'Access your Skyra account to sync favorites and settings.'}
              </Text>
              {user && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.accent, width: '100%', alignSelf: 'center', marginBottom: 12 }]}
                  onPress={() => router.push('/account/profile')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: theme.card }]}>Edit Profile</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: user ? theme.error : theme.accent, width: '100%', alignSelf: 'center', marginTop: 0, marginBottom: 0 }]}
                onPress={async () => {
                  if (user) {
                    await supabase.auth.signOut();
                    setUser(null);
                    showToast('Successfully logged out! 👋', 'success');
                  } else {
                    router.push('/auth/login');
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: theme.card }]}>
                  {user ? 'Log Out' : 'Sign In / Sign Up'}
                </Text>
              </TouchableOpacity>
              

            </View>
          </View>

          {/* Temperature Unit */}
          <SettingsSection icon="thermometer-outline" title="Temperature Unit" theme={theme}>
            <View style={[styles.segmentedControl, { backgroundColor: theme.border + '40' }]}> 
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  unit === 'C' && { backgroundColor: theme.accent },
                ]}
                onPress={() => handleSetUnit('C')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: unit === 'C' ? '#fff' : theme.text },
                  unit === 'C' && styles.segmentTextActive
                ]}>
                  °C
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  unit === 'F' && { backgroundColor: theme.accent },
                ]}
                onPress={() => handleSetUnit('F')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: unit === 'F' ? '#fff' : theme.text },
                  unit === 'F' && styles.segmentTextActive
                ]}>
                  °F
                </Text>
              </TouchableOpacity>
            </View>
          </SettingsSection>

          {/* Wind Speed Unit */}
          <SettingsSection icon="speedometer-outline" title="Wind Speed Unit" theme={theme}>
            <View style={[styles.segmentedControl, { backgroundColor: theme.border + '40' }]}> 
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  windUnit === 'mph' && { backgroundColor: theme.accent },
                ]}
                onPress={() => handleSetWindUnit('mph')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: windUnit === 'mph' ? '#fff' : theme.text },
                  windUnit === 'mph' && styles.segmentTextActive
                ]}>
                  mph
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  windUnit === 'kph' && { backgroundColor: theme.accent },
                ]}
                onPress={() => handleSetWindUnit('kph')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: windUnit === 'kph' ? '#fff' : theme.text },
                  windUnit === 'kph' && styles.segmentTextActive
                ]}>
                  kph
                </Text>
              </TouchableOpacity>
            </View>
          </SettingsSection>

          {/* Enhanced Notifications */}
          <SettingsSection icon="notifications-outline" title="Notifications" theme={theme}>
            <View style={[styles.notificationCard, { backgroundColor: theme.card }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingHeader}>
                    <Ionicons name="notifications" size={20} color={theme.accent} />
                    <Text style={[styles.settingLabel, { color: theme.text }]}>General Notifications</Text>
                  </View>
                  <Text style={[styles.settingDescription, { color: theme.text + '70' }]}> 
                    Weather updates and forecasts
                  </Text>
                </View>
                <CustomSwitch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  theme={theme}
                />
              </View>
              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingHeader}>
                    <Ionicons name="warning" size={20} color={theme.error} />
                    <Text style={[styles.settingLabel, { color: theme.text }]}>Severe Weather Alerts</Text>
                  </View>
                  <Text style={[styles.settingDescription, { color: theme.text + '70' }]}> 
                    Important weather warnings
                  </Text>
                </View>
                <CustomSwitch
                  value={severeAlertsEnabled}
                  onValueChange={setSevereAlertsEnabled}
                  theme={theme}
                />
              </View>
              
              {/* Test Notification Button */}
              <TouchableOpacity
                style={[styles.testNotificationButton, { backgroundColor: theme.accent + '20', borderColor: theme.accent }]}
                onPress={handleTestNotification}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-circle" size={24} color={theme.accent} />
                <Text style={[styles.testNotificationText, { color: theme.accent }]}>
                  Test Notification
                </Text>
              </TouchableOpacity>
            </View>
          </SettingsSection>

          {/* Enhanced Theme Selection */}
          <SettingsSection icon="color-palette-outline" title="Appearance" theme={theme}>
            <View style={[styles.themeGrid]}>
              {themes.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: themeName === t.value ? theme.accent + '20' : theme.border + '20',
                      borderColor: themeName === t.value ? theme.accent : 'transparent',
                    }
                  ]}
                  onPress={() => handleSetTheme(t.value as 'system' | 'light' | 'dark')}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={t.icon as any} 
                    size={24} 
                    color={themeName === t.value ? theme.accent : theme.text + '80'} 
                  />
                  <Text style={[
                    styles.themeLabel, 
                    { color: themeName === t.value ? theme.accent : theme.text }
                  ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingsSection>

          {/* Enhanced About Section */}
          <SettingsSection icon="information-circle-outline" title="About Skyra" theme={theme}>
            <View style={styles.aboutContent}>
              <View style={styles.appInfo}>
                <Text style={[styles.appVersion, { color: theme.accent }]}>v1.3.0</Text>
                <Text style={[styles.appTagline, { color: theme.text }]}>&quot;Weather, reimagined.&quot;</Text>
                <Text style={[styles.appDescription, { color: theme.text + '80' }]}> 
                  Skyra is a modern, calming weather app designed for clarity and beauty. 
                  Powered by OpenWeather and built with ❤️ using React Native & Expo.
                </Text>
              </View>
              <View style={styles.aboutActions}>
                <TouchableOpacity 
                  style={[styles.aboutButton, { backgroundColor: theme.border + '40', width: '100%' }]} 
                  onPress={() => setChangelogVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="list-outline" size={18} color={theme.accent} />
                  <Text style={[styles.aboutButtonText, { color: theme.text }]}>Changelog</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.aboutButton, { backgroundColor: theme.border + '40', width: '100%' }]} 
                  onPress={() => Linking.openURL('https://forms.gle/VFvJ88jjtDx71Pvr7')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.accent} />
                  <Text style={[styles.aboutButtonText, { color: theme.text }]}>Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.aboutButton, { backgroundColor: theme.border + '40', width: '100%' }]} 
                  onPress={() => Linking.openURL('https://skyra.samuelesnow.co/')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="globe-outline" size={18} color={theme.accent} />
                  <Text style={[styles.aboutButtonText, { color: theme.text }]}>Visit Website</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SettingsSection>

          {/* Enhanced Replay Onboarding */}
          <TouchableOpacity
            style={[styles.replayButton, { backgroundColor: theme.card }]}
            onPress={async () => {
              await AsyncStorage.removeItem('onboardingComplete');
              await Updates.reloadAsync();
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.replayIconContainer, { backgroundColor: theme.accent + '20' }]}> 
              <Ionicons name="refresh" size={24} color={theme.accent} />
            </View>
            <View style={styles.replayTextContainer}>
              <Text style={[styles.replayTitle, { color: theme.text }]}>Replay Tutorial</Text>
              <Text style={[styles.replaySubtitle, { color: theme.text + '70' }]}> 
                Go through the onboarding again
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.text + '60'} />
          </TouchableOpacity>

          {/* Enhanced Changelog Modal */}
          <Modal
            visible={changelogVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setChangelogVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}> 
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>What's New</Text>
                  <TouchableOpacity
                    style={[styles.modalCloseButton, { backgroundColor: theme.border + '40' }]}
                    onPress={() => setChangelogVisible(false)}
                  >
                    <Ionicons name="close" size={20} color={theme.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.changelogScroll} showsVerticalScrollIndicator={false}>
                  {CHANGELOG.map((log, idx) => (
                    <View key={log.version} style={[
                      styles.changelogVersion,
                      idx > 0 && { borderTopWidth: 1, borderTopColor: theme.border + '40' }
                    ]}>
                      <View style={styles.versionHeader}>
                        <Text style={[styles.versionNumber, { color: theme.accent }]}>{log.version}</Text>
                        <Text style={[styles.versionDate, { color: theme.text + '60' }]}>{log.date}</Text>
                      </View>
                      {log.entries.map((entry, i) => (
                        <View key={i} style={styles.changelogEntry}>
                          <View style={[
                            styles.entryTypeIndicator,
                            { backgroundColor: getEntryColor(entry.type) + '20' }
                          ]}>
                            <Ionicons
                              name={getEntryIcon(entry.type)}
                              size={14}
                              color={getEntryColor(entry.type)}
                            />
                          </View>
                          <Text style={[styles.entryText, { color: theme.text }]}>{entry.text}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY: toastAnim }],
              backgroundColor: toastType === 'success' ? '#4CAF50' : '#FF6B6B',
            },
          ]}
        >
          <View style={styles.toastContent}>
            <Ionicons
              name={toastType === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color="#fff"
            />
            <Text style={styles.toastText}>{toastMessage}</Text>
            <TouchableOpacity onPress={hideToast} style={styles.toastClose}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const getEntryIcon = (type: string): any => {
  switch (type) {
    case 'added': return 'add-circle' as any;
    case 'improved': return 'trending-up' as any;
    case 'fixed': return 'checkmark-circle' as any;
    default: return 'information-circle' as any;
  }
};

const getEntryColor = (type: string): string => {
  switch (type) {
    case 'added': return '#4CAF50';
    case 'improved': return '#2196F3';
    case 'fixed': return '#FF9800';
    default: return '#9E9E9E';
  }
};

const themes = [
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
];

const CHANGELOG = [
  {
    version: 'v1.3.0',
    date: '2025-01-27',
    entries: [
      { type: 'added', text: 'Added comprehensive onboarding experience with 6 beautiful screens' },
      { type: 'added', text: 'Added Google Identity Services integration for web sign-in' },
      { type: 'added', text: 'Added wind speed unit preferences (mph/kph) with mph default' },
      { type: 'added', text: 'Added storm loading animation throughout the app' },
      { type: 'added', text: 'Added favorites functionality to search city modal' },
      { type: 'added', text: 'Added proper dark theming for search modal' },
      { type: 'improved', text: 'Improved onboarding with smooth transitions and rotating animations' },
      { type: 'improved', text: 'Improved wind speed display with user preference support' },
      { type: 'improved', text: 'Improved loading states with custom storm animations' },
      { type: 'improved', text: 'Improved search experience with better modal theming' },
      { type: 'fixed', text: 'Fixed Google Sign-In native module errors' },
      { type: 'fixed', text: 'Fixed search modal background and button styling' },
      { type: 'fixed', text: 'Fixed wind speed unit consistency across all screens' },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2025-07-23',
    entries: [
      { type: 'added', text: 'Added light and dark mode' },
      { type: 'added', text: 'Added theme-aware navigation bar and cards' },
      { type: 'added', text: 'Added city autocomplete suggestions in search' },
      { type: 'added', text: 'Added full city details modal from search' },
      { type: 'added', text: 'Added onboarding tutorial and replay option' },
      { type: 'improved', text: 'Improved UI and card visibility in all themes' },
      { type: 'improved', text: 'Improved favoriting and search experience' },
      { type: 'improved', text: 'Improved keyboard UX in search' },
      { type: 'fixed', text: 'Fixed hourly forecast accuracy and stability' },
      { type: 'fixed', text: 'Fixed theme switching and navigation bar bugs' },
      { type: 'fixed', text: 'Fixed card visibility in light mode' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-07-22',
    entries: [
      { type: 'added', text: 'Initial release of Skyra' },
      { type: 'added', text: 'Modern, calming UI with animated backgrounds' },
      { type: 'added', text: 'Current, hourly, and 5/10-day forecasts' },
      { type: 'added', text: 'Search for any city’s weather' },
      { type: 'improved', text: 'Global settings: units, theme, location' },
      { type: 'added', text: 'About & changelog sections' },
    ],
  },
  // Add more versions here as needed
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  header: {
    marginTop: 48,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  profileCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileSubtitle: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 2,
  },
  enhancedCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  enhancedCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'column',
  },
  segmentText: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.7,
  },
  segmentTextActive: {
    opacity: 1,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  settingRowLast: {
    marginBottom: 0,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  themeOption: {
    width: '45%', // Adjust as needed for 2 columns
    aspectRatio: 1.2, // Make options slightly taller
    borderRadius: 12,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  aboutContent: {
    marginTop: 10,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  appTagline: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.85,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 2,
  },
  aboutActions: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  aboutButtonText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
  replayButton: {
    borderRadius: 18,
    padding: 22,
    marginTop: 32,
    marginBottom: 100, // Add extra bottom margin to avoid bottom navigation
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replayIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replayTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  replayTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  replaySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 30, 0.98)',
    borderRadius: 18,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changelogScroll: {
    maxHeight: 350,
    width: '100%',
  },
  changelogVersion: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionDate: {
    fontSize: 13,
  },
  changelogEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTypeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  entryText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  authModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0008',
  },
  authModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },
  authCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  authIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  authSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  authForm: {
    width: '100%',
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authInput: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
  },
  authButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 14,
  },
  authFooter: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  linkButton: {
    marginBottom: 10,
  },
  linkText: {
    fontSize: 15,
    textAlign: 'center',
  },
  customSwitch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  testNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  testNotificationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 60 : 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  toastClose: {
    padding: 4,
  },
});

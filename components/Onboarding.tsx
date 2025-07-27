import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Linking,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingPage {
  key: string;
  title: string;
  subtitle: string;
  animation: any;
  showButtons?: boolean;
}

const onboardingPages: OnboardingPage[] = [
  {
    key: 'welcome',
    title: 'Welcome to Skyra',
    subtitle: 'Your weather. Calm, clear, and in your pocket.',
    animation: require('../assets/images/a-calm-sky-clouds-drifting.json'),
  },
  {
    key: 'radar',
    title: 'Stay Ahead of the Storm',
    subtitle: 'Get real-time radar and weather warnings.',
    animation: require('../assets/images/weather-radar.json'),
  },
  {
    key: 'location',
    title: 'Your City, Your Forecast',
    subtitle: 'Set your location and get tailored updates.',
    animation: require('../assets/images/map-animation.json'),
  },
  {
    key: 'notifications',
    title: 'Stay Updated',
    subtitle: 'Get weather alerts and important updates.',
    animation: require('../assets/images/allow-notifications.json'),
  },
  {
    key: 'weather-types',
    title: 'Know Before You Go',
    subtitle: 'Rain, snow, or sun – we\'ve got you covered.',
    animation: require('../assets/images/rain-tweetstorm-cartoon-lottie.json'),
  },
  {
    key: 'forecast',
    title: 'Fast & Accurate Forecasts',
    subtitle: 'Daily and hourly updates at a glance.',
    animation: require('../assets/images/weather-loading-animation.json'),
  },
  {
    key: 'account',
    title: 'Ready to Get Started?',
    subtitle: 'Sign in or skip to explore.',
    animation: require('../assets/images/account-setup.json'),
    showButtons: true,
  },
];

const Onboarding = ({ onFinish, onNavigateToAuth }: { onFinish: () => void; onNavigateToAuth?: (route: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDidItButton, setShowDidItButton] = useState(false);
  const [showSuspiciousModal, setShowSuspiciousModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNotificationDidItButton, setShowNotificationDidItButton] = useState(false);
  const [showNotificationSuspiciousModal, setShowNotificationSuspiciousModal] = useState(false);
  const [showNotificationThankYouModal, setShowNotificationThankYouModal] = useState(false);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<'granted' | 'denied' | 'pending'>('pending');
  const router = useRouter();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Weather type animations for page 4
  const weatherAnimations = [
    require('../assets/images/rain-tweetstorm-cartoon-lottie.json'),
    require('../assets/images/weather-snow.json'),
    require('../assets/images/weather-storm-loading.json'),
  ];

  // Location permission functions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionStatus('granted');
        // Show success popup
        Alert.alert(
          'Location Access Granted',
          'Thanks for sharing your location! This helps us provide accurate weather forecasts for your area.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        setLocationPermissionStatus('denied');
        setShowLocationModal(true);
      }
    } catch (error) {
      setLocationPermissionStatus('denied');
      setShowLocationModal(true);
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    // Show the "I Did It" button after opening settings
    setShowDidItButton(true);
    setShowLocationModal(false);
  };

  const handleLocationSkip = () => {
    setShowLocationModal(false);
    // Continue with onboarding
  };

  const handleDidItButton = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionStatus('granted');
        setShowDidItButton(false);
        setShowThankYouModal(true);
      } else {
        setShowSuspiciousModal(true);
      }
    } catch (error) {
      setShowSuspiciousModal(true);
    }
  };

  const handleSuspiciousModalDismiss = () => {
    setShowSuspiciousModal(false);
    setShowDidItButton(false);
  };

  const handleThankYouContinue = () => {
    setShowThankYouModal(false);
    // Continue with onboarding
  };

  // Notification permission functions
  const requestNotificationPermission = async () => {
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

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus === 'granted') {
        setNotificationPermissionStatus('granted');
        // Show success popup
        Alert.alert(
          'Notifications Enabled',
          'Thanks for enabling notifications! You\'ll receive weather alerts and important updates.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        setNotificationPermissionStatus('denied');
        setShowNotificationModal(true);
      }
    } catch (error) {
      setNotificationPermissionStatus('denied');
      setShowNotificationModal(true);
    }
  };

  const openNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    // Show the "I Did It" button after opening settings
    setShowNotificationDidItButton(true);
    setShowNotificationModal(false);
  };

  const handleNotificationSkip = () => {
    setShowNotificationModal(false);
    // Continue with onboarding
  };

  const handleNotificationDidItButton = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
        setNotificationPermissionStatus('granted');
        setShowNotificationDidItButton(false);
        setShowNotificationThankYouModal(true);
      } else {
        setShowNotificationSuspiciousModal(true);
      }
    } catch (error) {
      setShowNotificationSuspiciousModal(true);
    }
  };

  const handleNotificationSuspiciousModalDismiss = () => {
    setShowNotificationSuspiciousModal(false);
    setShowNotificationDidItButton(false);
  };

  const handleNotificationThankYouContinue = () => {
    setShowNotificationThankYouModal(false);
    // Continue with onboarding
  };

  useEffect(() => {
    // Start progress animation
    Animated.timing(progressAnim, {
      toValue: (currentPage + 1) / onboardingPages.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Rotate weather animations on page 4
    if (currentPage === 3) {
      const interval = setInterval(() => {
        setAnimationKey(prev => (prev + 1) % weatherAnimations.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      // Fade out current content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPage(currentPage + 1);
        // Fade in new content
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      // Fade out current content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPage(currentPage - 1);
        // Fade in new content
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    onFinish();
  };

  const handleSignUp = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    if (onNavigateToAuth) {
      onNavigateToAuth('/auth/signup');
    } else {
      onFinish();
      router.replace('/auth/signup');
    }
  };

  const handleSignIn = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    if (onNavigateToAuth) {
      onNavigateToAuth('/auth/login');
    } else {
      onFinish();
      router.replace('/auth/login');
    }
  };

  const currentPageData = onboardingPages[currentPage];
  const isLastPage = currentPage === onboardingPages.length - 1;
  const isWeatherTypesPage = currentPage === 4;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              key={isWeatherTypesPage ? animationKey : currentPage}
              source={isWeatherTypesPage ? weatherAnimations[animationKey] : currentPageData.animation}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentPageData.title}</Text>
            <Text style={styles.subtitle}>{currentPageData.subtitle}</Text>
            
            {/* Location Permission Button for page 3 */}
            {currentPage === 2 && (
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  locationPermissionStatus === 'granted' && styles.locationButtonGranted
                ]}
                onPress={requestLocationPermission}
                disabled={locationPermissionStatus === 'granted'}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={locationPermissionStatus === 'granted' ? 'checkmark-circle' : 'location'} 
                  size={24} 
                  color={locationPermissionStatus === 'granted' ? '#4CAF50' : '#fff'} 
                />
                <Text style={[
                  styles.locationButtonText,
                  locationPermissionStatus === 'granted' && styles.locationButtonTextGranted
                ]}>
                  {locationPermissionStatus === 'granted' ? 'Location Access Granted' : 'Enable Location Access'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Notification Permission Button for page 4 */}
            {currentPage === 3 && (
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  notificationPermissionStatus === 'granted' && styles.locationButtonGranted
                ]}
                onPress={requestNotificationPermission}
                disabled={notificationPermissionStatus === 'granted'}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={notificationPermissionStatus === 'granted' ? 'checkmark-circle' : 'notifications'} 
                  size={24} 
                  color={notificationPermissionStatus === 'granted' ? '#4CAF50' : '#fff'} 
                />
                <Text style={[
                  styles.locationButtonText,
                  notificationPermissionStatus === 'granted' && styles.locationButtonTextGranted
                ]}>
                  {notificationPermissionStatus === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
                </Text>
              </TouchableOpacity>
            )}

            {/* "I Did It" Button */}
            {showDidItButton && (
              <TouchableOpacity
                style={styles.didItButton}
                onPress={handleDidItButton}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.didItButtonText}>I Did It ✅</Text>
              </TouchableOpacity>
            )}

            {/* Notification "I Did It" Button */}
            {showNotificationDidItButton && (
              <TouchableOpacity
                style={styles.didItButton}
                onPress={handleNotificationDidItButton}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.didItButtonText}>I Did It ✅</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Account Setup Buttons */}
          {currentPageData.showButtons && (
            <View style={styles.buttonContainer}>
              <View style={styles.authButtonsRow}>
                <TouchableOpacity
                  style={[styles.authButton, styles.signUpButton]}
                  onPress={handleSignUp}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authButton, styles.signInButton]}
                  onPress={handleSignIn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.navButtons}>
            {currentPage > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={handlePrevious}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <View style={styles.spacer} />
            {!isLastPage && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Page Indicators */}
          <View style={styles.pageIndicators}>
            {onboardingPages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageIndicator,
                  index === currentPage && styles.pageIndicatorActive,
                ]}
              />
            ))}
          </View>
                  </View>
        </LinearGradient>

        {/* Location Permission Modal */}
        <Modal
          visible={showLocationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="location-outline" size={48} color="#FF6B6B" />
                <Text style={styles.modalTitle}>Location Access Disabled</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                We need your location to give you the most accurate forecast.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={openAppSettings}
                  activeOpacity={0.8}
                >
                  <Ionicons name="settings" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Open Settings</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.secondaryButton]}
                  onPress={handleLocationSkip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Suspicious Modal */}
        <Modal
          visible={showSuspiciousModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuspiciousModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <LottieView
                  source={require('../assets/images/suspicious-banana.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text style={styles.modalTitle}>Hmm... are you sure?</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                Because it still looks disabled to me 😅
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={handleSuspiciousModalDismiss}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Let Me Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Thank You Modal */}
        <Modal
          visible={showThankYouModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThankYouModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <LottieView
                  source={require('../assets/images/thank-you.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text style={styles.modalTitle}>Awesome! 🙌</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                Thanks for enabling location access!
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={handleThankYouContinue}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Notification Permission Modal */}
        <Modal
          visible={showNotificationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotificationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="notifications-outline" size={48} color="#FF6B6B" />
                <Text style={styles.modalTitle}>Notifications Disabled</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                We need notification access to send you weather alerts and important updates.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={openNotificationSettings}
                  activeOpacity={0.8}
                >
                  <Ionicons name="settings" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Open Settings</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.secondaryButton]}
                  onPress={handleNotificationSkip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Notification Suspicious Modal */}
        <Modal
          visible={showNotificationSuspiciousModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotificationSuspiciousModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <LottieView
                  source={require('../assets/images/suspicious-banana.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text style={styles.modalTitle}>Hmm... are you sure?</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                Because it still looks disabled to me 😅
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={handleNotificationSuspiciousModalDismiss}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Let Me Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Notification Thank You Modal */}
        <Modal
          visible={showNotificationThankYouModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotificationThankYouModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <LottieView
                  source={require('../assets/images/thank-you.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text style={styles.modalTitle}>Perfect! 🔔</Text>
              </View>
              
              <Text style={styles.modalDescription}>
                Thanks for enabling notifications! You'll receive weather alerts and updates.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={handleNotificationThankYouContinue}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  animationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  authButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButton: {
    backgroundColor: '#fff',
  },
  signInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  navigation: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 20,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  spacer: {
    flex: 1,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pageIndicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
    gap: 8,
  },
  locationButtonGranted: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationButtonTextGranted: {
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  didItButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  didItButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Onboarding; 
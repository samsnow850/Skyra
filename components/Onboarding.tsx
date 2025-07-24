import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const pages = [
  {
    key: 'welcome',
    title: 'Welcome to Skyra!',
    description: 'Your modern weather companion. Get real-time weather updates with a beautiful interface.',
    image: require('../assets/images/skyra-logo.png'),
  },
  {
    key: 'about',
    title: 'About the App',
    description: 'Skyra helps you stay prepared with accurate forecasts, hourly breakdowns, and a sleek design. Explore, favorite, and search cities easily.',
    image: require('../assets/images/weather-loading-animation.json'), // Placeholder, replace with a static image if needed
    isLottie: true,
  },
  {
    key: 'thanks',
    title: 'Thank You!',
    description: 'Thanks for being a beta tester. Your feedback helps us improve. Enjoy using Skyra!',
    image: require('../assets/images/icon.png'),
  },
];

const Onboarding = ({ onFinish }: { onFinish: () => void }) => {
  const [page, setPage] = useState(0);

  const handleNext = async () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    } else {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      onFinish();
    }
  };

  const current = pages[page];

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {current.isLottie ? (
          <Ionicons name="partly-sunny" size={100} color="#fff" />
        ) : (
          <Image source={current.image} style={styles.image} resizeMode="contain" />
        )}
      </View>
      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.description}>{current.description}</Text>
      <View style={styles.dotsContainer}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.dot, page === i && styles.activeDot]} />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>{page === pages.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232526',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  imageContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.7,
    height: width * 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Onboarding; 
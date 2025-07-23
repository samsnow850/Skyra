import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useUnit } from '../../context/UnitContext';

const { width, height } = Dimensions.get('window');

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_max: number;
    temp_min: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const OPEN_WEATHER_API_KEY = '4862d5e067388e783d46e5265ed1c203';

// Weather condition mappings for backgrounds and animations
const weatherThemes: Record<string, {
  gradient: readonly [string, string];
  icon: string;
  particles: string;
}> = {
  Clear: {
    gradient: ['#FFB75B', '#ED8F03'],
    icon: 'sunny',
    particles: '☀️',
  },
  Clouds: {
    gradient: ['#8E9EAB', '#EEF2F3'],
    icon: 'cloudy',
    particles: '☁️',
  },
  Rain: {
    gradient: ['#4B79A1', '#283E51'],
    icon: 'rainy',
    particles: '🌧️',
  },
  Drizzle: {
    gradient: ['#89CFF0', '#4682B4'],
    icon: 'rainy-outline',
    particles: '💧',
  },
  Thunderstorm: {
    gradient: ['#232526', '#414345'],
    icon: 'thunderstorm',
    particles: '⚡',
  },
  Snow: {
    gradient: ['#E0EAFC', '#CFDEF3'],
    icon: 'snow',
    particles: '❄️',
  },
  Mist: {
    gradient: ['#606c88', '#3f4c6b'],
    icon: 'partly-sunny',
    particles: '🌫️',
  },
};

const WeatherCard: React.FC<{ title: string; value: string; icon: string }> = ({
  title,
  value,
  icon,
}) => (
  <View style={styles.weatherCard}>
    <Ionicons name={icon as any} size={24} color="#fff" style={styles.cardIcon} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { unit, setUnit } = useUnit();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const fetchWeather = async (loc?: LocationObject) => {
    try {
      const currentLocation = loc || location;
      if (!currentLocation) return;

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setWeather(data);
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Failed to fetch weather data');
      }
    } catch (error) {
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
      await fetchWeather(loc);
    } catch (error) {
      setErrorMsg('Failed to get location');
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      await requestLocation();
      setLoading(false);

      // Animate in the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    };

    initializeApp();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeather();
    setRefreshing(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentWeatherCondition = weather?.weather[0]?.main || 'Clear';
  const theme = weatherThemes[currentWeatherCondition as keyof typeof weatherThemes] || weatherThemes.Clear;

  const safeTemp = weather?.main && typeof weather.main.temp === 'number' ? Math.round(weather.main.temp) : '--';
  const safeFeelsLike = weather?.main && typeof weather.main.feels_like === 'number' ? Math.round(weather.main.feels_like) : '--';
  const safeDescription = weather?.weather && weather.weather[0] && weather.weather[0].description
    ? weather.weather[0].description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Unknown';

  const displayTemp = (tempC: number) => unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  const displayTempWithUnit = (tempC: number) => unit === 'C' ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Getting your weather...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#ff6b6b', '#ee5a24']} style={styles.gradient}>
          <View style={styles.errorContent}>
            <Ionicons name="warning-outline" size={64} color="#fff" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorMessage}>{errorMsg}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradient} style={styles.gradient}>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#fff']}
            />
          }
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.topBarLeft}>
                <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.cityName}>{weather?.name || '—'}</Text>
              </View>
              <Text style={styles.timeText}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={styles.lastUpdatedText}>
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </Text>

            {/* Main Weather Card */}
            <View style={styles.mainWeatherCard}>
              {/* Animated background glow for sunny */}
              {currentWeatherCondition === 'Clear' && (
                <View style={styles.sunGlow} />
              )}
              <Ionicons
                name={weatherThemes[currentWeatherCondition]?.icon as any || 'cloud'}
                size={90}
                color="#fff"
                style={styles.mainWeatherIcon}
              />
              <Text style={styles.mainTemp}>{displayTempWithUnit(weather?.main.temp || 0)}</Text>
              <Text style={styles.weatherDesc}>{safeDescription}</Text>
              <Text style={styles.feelsLike}>Feels like {displayTempWithUnit(weather?.main.feels_like || 0)}</Text>
              <Text style={styles.highLow}>
                H:{displayTempWithUnit(weather?.main.temp_max || 0)}  L:{displayTempWithUnit(weather?.main.temp_min || 0)}
              </Text>
            </View>

            {/* Weather Details Cards */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailsRow}>
                <WeatherCard
                  title="Humidity"
                  value={`${weather?.main.humidity || 0}%`}
                  icon="water"
                />
                <WeatherCard
                  title="Wind Speed"
                  value={`${weather?.wind.speed || 0} m/s`}
                  icon="wind"
                />
              </View>
              <View style={styles.detailsRow}>
                <WeatherCard
                  title="Pressure"
                  value={`${weather?.main.pressure || 0} hPa`}
                  icon="speedometer"
                />
                <WeatherCard
                  title="Sunrise"
                  value={formatTime(weather?.sys.sunrise || 0)}
                  icon="sunny"
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '300',
  },
  errorContainer: {
    flex: 1,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  errorMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
  weatherIcon: {
    opacity: 0.8,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 10,
  },
  temperature: {
    color: '#fff',
    fontSize: 120,
    fontWeight: '100',
    lineHeight: 120,
  },
  temperatureUnit: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '300',
    marginTop: 20,
  },
  description: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '300',
  },
  feelsLike: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 60,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weatherCard: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)', // darker and more opaque
    borderRadius: 16,
    padding: 20,
    width: (width - 60) / 2,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
    opacity: 0.8,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lastUpdatedText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  mainWeatherCard: {
    justifyContent: 'center',
    marginVertical: 18,
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.10)',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  sunGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 220, 100, 0.25)',
    zIndex: 0,
    transform: [{ translateX: -110 }, { translateY: -110 }],
  },
  mainWeatherIcon: {
    marginBottom: 8,
    zIndex: 1,
  },
  mainTemp: {
    color: '#fff',
    fontSize: 90,
    fontWeight: '200',
    zIndex: 1,
    marginBottom: 2,
  },
  weatherDesc: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '400',
    marginBottom: 2,
    zIndex: 1,
    textTransform: 'capitalize',
  },
  feelsLike: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 2,
    zIndex: 1,
  },
  highLow: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    zIndex: 1,
  },
});
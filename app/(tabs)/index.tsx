import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';
import { formatWindSpeed } from '../../utils/windSpeed';
import { supabase } from '../../utils/supabase';

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
  visibility?: number;
  uvi?: number;
}

interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const OPEN_WEATHER_API_KEY = '4862d5e067388e783d46e5265ed1c203';

// Enhanced weather themes with modern gradients
const weatherThemes: Record<string, {
  gradient: readonly [string, string, string];
  icon: string;
  accentColor: string;
}> = {
  Clear: {
    gradient: ['#FF9A8B', '#A8E6CF', '#FFD3A5'],
    icon: 'sunny',
    accentColor: '#FF6B35',
  },
  Clouds: {
    gradient: ['#A8EDEA', '#FED6E3', '#D1C4E9'],
    icon: 'cloudy',
    accentColor: '#667eea',
  },
  Rain: {
    gradient: ['#4c669f', '#3b5998', '#192f6a'],
    icon: 'rainy',
    accentColor: '#4fc3f7',
  },
  Drizzle: {
    gradient: ['#89CFF0', '#4682B4', '#2E8B57'],
    icon: 'rainy-outline',
    accentColor: '#29b6f6',
  },
  Thunderstorm: {
    gradient: ['#232526', '#414345', '#2c3e50'],
    icon: 'thunderstorm',
    accentColor: '#9c27b0',
  },
  Snow: {
    gradient: ['#E0EAFC', '#CFDEF3', '#a8edea'],
    icon: 'snow',
    accentColor: '#00bcd4',
  },
  Mist: {
    gradient: ['#606c88', '#3f4c6b', '#34495e'],
    icon: 'partly-sunny',
    accentColor: '#607d8b',
  },
};

const ModernWeatherCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: string;
  accentColor: string;
  cardColor?: string;
}> = ({ title, value, icon, accentColor, cardColor }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.modernWeatherCard, { borderLeftColor: accentColor, backgroundColor: cardColor }]}> 
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={20} color={accentColor} />
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
};

const HourlyForecastCard: React.FC<{
  time: string;
  temp: number;
  icon: string;
  unit: string;
  cardColor?: string;
}> = ({ time, temp, icon, unit, cardColor }) => {
  const { theme } = useTheme();
  const displayTemp = unit === 'C' ? Math.round(temp) : Math.round(temp * 9/5 + 32);
  return (
    <View style={[styles.hourlyCard, { backgroundColor: cardColor }]}> 
      <Text style={[styles.hourlyTime, { color: theme.text }]}>{time}</Text>
      <Ionicons name={icon as any} size={24} color={theme.text} style={styles.hourlyIcon} />
      <Text style={[styles.hourlyTemp, { color: theme.text }]}>{displayTemp}°</Text>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const { unit, setUnit, windUnit } = useUnit();
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user data and name
  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Get name from user metadata or email
          const name = user.user_metadata?.name || user.email?.split('@')[0] || '';
          setUserName(name);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async (loc?: LocationObject) => {
    try {
      const currentLocation = loc || location;
      if (!currentLocation) return;

      // Fetch current weather
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

      // Fetch hourly forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
      );
      const forecastData = await forecastRes.json();
      if (forecastRes.ok && forecastData.list) {
        // Get next 6 3-hour intervals
        setHourly(forecastData.list.slice(0, 6));
      } else {
        setHourly([]);
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
      
      // Check if location permission is already granted
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        await requestLocation();
      } else {
        // Don't request location automatically - let onboarding handle it
        setErrorMsg('Location access needed for weather data. Please enable location in settings or complete onboarding.');
      }
      
      setLoading(false);

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

  const displayTemp = (tempC: number) => unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  const displayTempWithUnit = (tempC: number) => unit === 'C' ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;

  const currentWeatherCondition = weather?.weather[0]?.main || 'Clear';
  const weatherTheme = weatherThemes[currentWeatherCondition as keyof typeof weatherThemes] || weatherThemes.Clear;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
        <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingIconContainer}>
              <LottieView
                source={require('../../assets/images/weather-storm-loading.json')}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
              />
            </View>
            <Text style={[styles.loadingText, { color: theme.text }]}>Getting your weather...</Text>
            <Text style={[styles.loadingSubtext, { color: theme.text }]}>Please wait while we fetch the latest data</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
        <LinearGradient colors={[theme.error, theme.accent, theme.card] as any} style={styles.gradient}>
          <View style={styles.errorContent}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="warning-outline" size={64} color={theme.text} />
            </View>
            <Text style={[styles.errorTitle, { color: theme.text }]}>Oops!</Text>
            <Text style={[styles.errorMessage, { color: theme.text }]}>{errorMsg}</Text>
            <TouchableOpacity style={[styles.retryButton, { borderColor: theme.border }]} onPress={requestLocation}>
              <Text style={[styles.retryButtonText, { color: theme.text }]}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
              colors={[theme.text]}
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
            {/* Extra top spacing */}
            <View style={{ height: 48 }} />
            
            {/* Personalized Greeting */}
            {user && userName && (
              <View style={styles.greetingContainer}>
                <Text style={[styles.greetingText, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
                  {getGreeting()}, {userName}
                </Text>
              </View>
            )}
            
            {/* Modern Header */}
            <View style={styles.modernHeader}>
              <View style={styles.locationSection}>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={18} color={theme.text} />
                  <Text style={[styles.cityName, { color: theme.text }]}>{weather?.name || '—'}</Text>
                </View>
                <Text style={[styles.dateTime, { color: theme.text }]}>
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={[styles.unitToggle, { borderColor: theme.border }]}
                  onPress={() => setUnit(unit === 'C' ? 'F' : 'C')}
                >
                  <Text style={[styles.unitToggleText, { color: theme.text }]}>°{unit}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Weather Display */}
            <View style={[styles.mainWeatherContainer, { backgroundColor: theme.card }]}> 
              <View style={styles.temperatureSection}>
                <Ionicons
                  name={weatherTheme.icon as any}
                  size={80}
                  color={theme.text}
                  style={styles.mainWeatherIcon}
                />
                <Text style={[styles.mainTemperature, { color: theme.text }]}>
                  {displayTemp(weather?.main.temp || 0)}°
                </Text>
              </View>
              <Text style={[styles.weatherDescription, { color: theme.text }]}>
                {weather?.weather[0]?.description?.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') || 'Unknown'}
              </Text>
              <Text style={[styles.feelsLike, { color: theme.text }]}> 
                Feels like {displayTempWithUnit(weather?.main.feels_like || 0)}
              </Text>
              <View style={[styles.highLowContainer, { backgroundColor: theme.border }]}> 
                <Text style={[styles.highLowText, { color: theme.text }]}> 
                  H:{displayTemp(weather?.main.temp_max || 0)}°  
                  L:{displayTemp(weather?.main.temp_min || 0)}°
                </Text>
              </View>
            </View>

            {/* Hourly Forecast */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Hourly Forecast</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.hourlyScroll}
              >
                {hourly.map((hour, index) => (
                  <HourlyForecastCard
                    key={index}
                    time={new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    temp={hour.main.temp}
                    icon={hour.weather[0].main === 'Clear' ? 'sunny' : hour.weather[0].main === 'Rain' ? 'rainy' : 'cloudy'}
                    unit={unit}
                    cardColor={theme.card}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Weather Details Grid */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Weather Details</Text>
              <View style={styles.detailsGrid}>
                <ModernWeatherCard
                  title="Humidity"
                  value={`${weather?.main.humidity || 0}%`}
                  icon="water"
                  accentColor={theme.accent}
                  cardColor={theme.card}
                />
                <ModernWeatherCard
                  title="Wind Speed"
                  value={formatWindSpeed(weather?.wind.speed || 0, windUnit)}
                  icon="leaf"
                  accentColor={theme.accent}
                  cardColor={theme.card}
                />
                <ModernWeatherCard
                  title="Pressure"
                  value={`${weather?.main.pressure || 0} hPa`}
                  icon="speedometer"
                  accentColor={theme.accent}
                  cardColor={theme.card}
                />
                <ModernWeatherCard
                  title="Visibility"
                  value={`${weather?.visibility ? (weather.visibility / 1000).toFixed(1) : '10'} km`}
                  icon="eye"
                  accentColor={theme.accent}
                  cardColor={theme.card}
                />
              </View>
            </View>

            {/* Sun Times */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Sun & Moon</Text>
              <View style={styles.sunTimesContainer}>
                <View style={[styles.sunTimeCard, { backgroundColor: theme.card }]}> 
                  <Ionicons name="sunny" size={24} color="#FFA726" />
                  <Text style={[styles.sunTimeLabel, { color: theme.text }]}>Sunrise</Text>
                  <Text style={[styles.sunTimeValue, { color: theme.text }]}>{formatTime(weather?.sys.sunrise || 0)}</Text>
                </View>
                <View style={[styles.sunTimeCard, { backgroundColor: theme.card }]}> 
                  <Ionicons name="moon" size={24} color="#AB47BC" />
                  <Text style={[styles.sunTimeLabel, { color: theme.text }]}>Sunset</Text>
                  <Text style={[styles.sunTimeValue, { color: theme.text }]}>{formatTime(weather?.sys.sunset || 0)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomPadding} />
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
    padding: 40,
  },
  loadingIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
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
  errorIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 40,
    padding: 20,
    marginBottom: 20,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingTop: 20,
  },
  locationSection: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cityName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 6,
  },
  dateTime: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitToggle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  unitToggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  mainWeatherContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    padding: 30,
  },
  temperatureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainWeatherIcon: {
    marginRight: 16,
  },
  mainTemperature: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '200',
    lineHeight: 72,
  },
  weatherDescription: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  feelsLike: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  highLowContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  highLowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.9,
  },
  hourlyScroll: {
    marginHorizontal: -5,
  },
  hourlyCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hourlyTime: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  hourlyIcon: {
    marginBottom: 8,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modernWeatherCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 6,
    fontWeight: '500',
  },
  cardValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  sunTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sunTimeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 20,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sunTimeLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  sunTimeValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  greetingContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'left',
    letterSpacing: 0.5,
  },
});
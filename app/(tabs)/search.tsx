import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';
import { formatWindSpeed } from '../../utils/windSpeed';
import { supabase } from '../../utils/supabase';

const OPEN_WEATHER_API_KEY = '4862d5e067388e783d46e5265ed1c203';
const FAVORITES_KEY = 'FAVORITE_LOCATIONS';

function CityWeatherDetails({ city, onClose }: { city: any; onClose: () => void }) {
  const { theme } = useTheme();
  const { unit, windUnit } = useUnit();
  const [weather, setWeather] = useState<any>(null);
  const [hourly, setHourly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (user) {
      // Load from Supabase if user is logged in
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('city_name')
          .eq('user_id', user.id);
        
        if (data) {
          const cityNames = data.map(fav => fav.city_name);
          setFavorites(cityNames);
        }
      } catch (error) {
        console.log('Error loading favorites from Supabase:', error);
        // Fallback to AsyncStorage
        const data = await AsyncStorage.getItem(FAVORITES_KEY);
        if (data) setFavorites(JSON.parse(data));
      }
    } else {
      // Load from AsyncStorage if not logged in
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) setFavorites(JSON.parse(data));
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    setFavorites(newFavorites);
    
    if (user) {
      // Save to Supabase if user is logged in
      try {
        // First, delete all existing favorites for this user
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);
        
        // Then insert all new favorites
        if (newFavorites.length > 0) {
          const favoritesToInsert = newFavorites.map(cityName => ({
            user_id: user.id,
            city_name: cityName
          }));
          
          await supabase
            .from('user_favorites')
            .insert(favoritesToInsert);
        }
      } catch (error) {
        console.log('Error saving favorites to Supabase:', error);
        // Fallback to AsyncStorage
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      }
    } else {
      // Save to AsyncStorage if not logged in
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
    
    DeviceEventEmitter.emit('favoritesUpdated');
  };

  const isFavorite = (cityName: string) => favorites.includes(cityName);

  const toggleFavorite = async (cityName: string) => {
    if (isFavorite(cityName)) {
      const newFavorites = favorites.filter(fav => fav !== cityName);
      await saveFavorites(newFavorites);
    } else {
      const newFavorites = [...favorites, cityName];
      await saveFavorites(newFavorites);
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
        );
        const data = await res.json();
        if (res.ok) {
          setWeather(data);
        } else {
          setError(data.message || 'Failed to fetch weather');
        }
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
        );
        const forecastData = await forecastRes.json();
        if (forecastRes.ok && forecastData.list) {
          setHourly(forecastData.list.slice(0, 6));
        } else {
          setHourly([]);
        }
      } catch {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchWeather();
  }, [city]);

  const displayTemp = (tempC: number) => unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  const displayTempWithUnit = (tempC: number) => unit === 'C' ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;
  const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const weatherThemes = {
    Clear: { icon: 'sunny', accentColor: '#FF6B35' },
    Clouds: { icon: 'cloudy', accentColor: '#667eea' },
    Rain: { icon: 'rainy', accentColor: '#4fc3f7' },
    Drizzle: { icon: 'rainy-outline', accentColor: '#29b6f6' },
    Thunderstorm: { icon: 'thunderstorm', accentColor: '#9c27b0' },
    Snow: { icon: 'snow', accentColor: '#00bcd4' },
    Mist: { icon: 'partly-sunny', accentColor: '#607d8b' },
  };
  const currentWeatherCondition = (weather?.weather?.[0]?.main || 'Clear') as keyof typeof weatherThemes;
  const weatherTheme = weatherThemes[currentWeatherCondition] || weatherThemes.Clear;

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <LinearGradient colors={theme.backgroundGradient as any} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          source={require('../../assets/images/weather-storm-loading.json')}
          autoPlay
          loop
          style={{ width: 100, height: 100 }}
        />
        <Text style={{ color: theme.text, marginTop: 16, fontSize: 16 }}>Loading weather...</Text>
      </LinearGradient>
    </SafeAreaView>
  );
  
  if (error) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <LinearGradient colors={theme.backgroundGradient as any} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.error, textAlign: 'center', marginTop: 16 }}>{error}</Text>
      </LinearGradient>
    </SafeAreaView>
  );
  
  if (!weather) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <LinearGradient colors={theme.backgroundGradient as any} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={[styles.weatherCard, { backgroundColor: theme.card, position: 'relative' }]}> 
            <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
              <Ionicons name="close-circle" size={28} color={theme.error} />
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={[styles.cityName, { color: theme.text }]}>{weather.name}</Text>
              <TouchableOpacity 
                onPress={() => toggleFavorite(weather.name)}
                style={{ 
                  backgroundColor: isFavorite(weather.name) ? theme.accent : 'transparent',
                  borderWidth: 1,
                  borderColor: theme.accent,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6
                }}
              >
                <Ionicons 
                  name={isFavorite(weather.name) ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavorite(weather.name) ? theme.card : theme.accent} 
                />
              </TouchableOpacity>
            </View>
            
            <Ionicons name={weatherTheme.icon as any} size={60} color={theme.text} style={{ marginBottom: 8 }} />
            <Text style={[styles.temp, { color: theme.text }]}>{displayTempWithUnit(weather.main.temp)}</Text>
            <Text style={[styles.desc, { color: theme.text }]}>{weather.weather[0].description}</Text>
            <Text style={[styles.feelsLike, { color: theme.text }]}>Feels like {displayTempWithUnit(weather.main.feels_like)}</Text>
            <Text style={[styles.highLow, { color: theme.text }]}>H:{displayTempWithUnit(weather.main.temp_max)}  L:{displayTempWithUnit(weather.main.temp_min)}</Text>
          </View>
          
          {/* Hourly Forecast */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Hourly Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
              {hourly.map((hour, index) => (
                <View key={index} style={[styles.hourlyCard, { backgroundColor: theme.card }]}> 
                  <Text style={[styles.hourlyTime, { color: theme.text }]}>{new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  <Ionicons name={hour.weather[0].main === 'Clear' ? 'sunny' : hour.weather[0].main === 'Rain' ? 'rainy' : 'cloudy'} size={24} color={theme.text} style={styles.hourlyIcon} />
                  <Text style={[styles.hourlyTemp, { color: theme.text }]}>{displayTemp(hour.main.temp)}°</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          {/* Weather Details */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Weather Details</Text>
            <View style={styles.detailsGrid}>
              <View style={[styles.modernWeatherCard, { borderLeftColor: theme.accent, backgroundColor: theme.card }]}> 
                <View style={styles.cardHeader}>
                  <Ionicons name="water" size={20} color={theme.accent} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Humidity</Text>
                </View>
                <Text style={[styles.cardValue, { color: theme.text }]}>{weather.main.humidity}%</Text>
              </View>
              <View style={[styles.modernWeatherCard, { borderLeftColor: theme.accent, backgroundColor: theme.card }]}> 
                <View style={styles.cardHeader}>
                  <Ionicons name="leaf" size={20} color={theme.accent} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Wind Speed</Text>
                </View>
                <Text style={[styles.cardValue, { color: theme.text }]}>{formatWindSpeed(weather.wind.speed, windUnit)}</Text>
              </View>
              <View style={[styles.modernWeatherCard, { borderLeftColor: theme.accent, backgroundColor: theme.card }]}> 
                <View style={styles.cardHeader}>
                  <Ionicons name="speedometer" size={20} color={theme.accent} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Pressure</Text>
                </View>
                <Text style={[styles.cardValue, { color: theme.text }]}>{weather.main.pressure} hPa</Text>
              </View>
              <View style={[styles.modernWeatherCard, { borderLeftColor: theme.accent, backgroundColor: theme.card }]}> 
                <View style={styles.cardHeader}>
                  <Ionicons name="eye" size={20} color={theme.accent} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Visibility</Text>
                </View>
                <Text style={[styles.cardValue, { color: theme.text }]}>{weather.visibility ? (weather.visibility / 1000).toFixed(1) : '10'} km</Text>
              </View>
            </View>
          </View>
          
          {/* Sun & Moon */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sun & Moon</Text>
            <View style={styles.sunTimesContainer}>
              <View style={[styles.sunTimeCard, { backgroundColor: theme.card }]}> 
                <Ionicons name="sunny" size={24} color="#FFA726" />
                <Text style={[styles.sunTimeLabel, { color: theme.text }]}>Sunrise</Text>
                <Text style={[styles.sunTimeValue, { color: theme.text }]}>{formatTime(weather.sys.sunrise)}</Text>
              </View>
              <View style={[styles.sunTimeCard, { backgroundColor: theme.card }]}> 
                <Ionicons name="moon" size={24} color="#AB47BC" />
                <Text style={[styles.sunTimeLabel, { color: theme.text }]}>Sunset</Text>
                <Text style={[styles.sunTimeValue, { color: theme.text }]}>{formatTime(weather.sys.sunset)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { unit } = useUnit();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (user) {
      // Load from Supabase if user is logged in
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('city_name')
          .eq('user_id', user.id);
        
        if (data) {
          const cityNames = data.map(fav => fav.city_name);
          setFavorites(cityNames);
        }
      } catch (error) {
        console.log('Error loading favorites from Supabase:', error);
        // Fallback to AsyncStorage
        const data = await AsyncStorage.getItem(FAVORITES_KEY);
        if (data) setFavorites(JSON.parse(data));
      }
    } else {
      // Load from AsyncStorage if not logged in
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) setFavorites(JSON.parse(data));
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    setFavorites(newFavorites);
    
    if (user) {
      // Save to Supabase if user is logged in
      try {
        // First, delete all existing favorites for this user
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);
        
        // Then insert all new favorites
        if (newFavorites.length > 0) {
          const favoritesToInsert = newFavorites.map(cityName => ({
            user_id: user.id,
            city_name: cityName
          }));
          
          await supabase
            .from('user_favorites')
            .insert(favoritesToInsert);
        }
      } catch (error) {
        console.log('Error saving favorites to Supabase:', error);
        // Fallback to AsyncStorage
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      }
    } else {
      // Save to AsyncStorage if not logged in
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
    
    DeviceEventEmitter.emit('favoritesUpdated'); // Notify other tabs
  };

  const isFavorite = (city: string) => favorites.includes(city);

  const toggleFavorite = async (city: string) => {
    if (isFavorite(city)) {
      const newFavorites = favorites.filter(fav => fav !== city);
      await saveFavorites(newFavorites);
    } else {
      const newFavorites = [...favorites, city];
      await saveFavorites(newFavorites);
    }
  };

  const displayTemp = (tempC: number) => unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  const displayTempWithUnit = (tempC: number) => unit === 'C' ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 9/5 + 32)}°F`;

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setWeather(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
      } else {
        setErrorMsg(data.message || 'City not found');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Fetch city suggestions as user types
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPEN_WEATHER_API_KEY}`
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  // When a suggestion is tapped
  const handleSuggestion = (city: any) => {
    setQuery(city.name);
    setShowSuggestions(false);
    setSelectedCity(city);
    // Optionally, trigger search immediately:
    // handleSearch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
        <Text style={[styles.title, { color: theme.text }]}>Search City Weather</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Enter city name..."
            placeholderTextColor={theme.text + '99'}
            value={query}
            onChangeText={text => {
              setQuery(text);
              setShowSuggestions(true);
            }}
            autoCapitalize="words"
            returnKeyType="search"
            blurOnSubmit={true}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.accent }]} onPress={handleSearch}>
            <Ionicons name="search" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={{ backgroundColor: theme.card, borderRadius: 10, marginHorizontal: 8, marginBottom: 8, elevation: 4 }}>
            {suggestions.map((city, idx) => (
              <TouchableOpacity
                key={city.lat + '-' + city.lon + '-' + idx}
                style={{ padding: 14, borderBottomWidth: idx !== suggestions.length - 1 ? 1 : 0, borderBottomColor: theme.border }}
                onPress={() => handleSuggestion(city)}
              >
                <Text style={{ color: theme.text, fontSize: 16 }}>
                  {city.name}
                  {city.state ? `, ${city.state}` : ''}
                  {city.country ? `, ${city.country}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* City Weather Details Modal */}
        <Modal
          visible={!!selectedCity}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSelectedCity(null)}
        >
          {selectedCity && (
            <CityWeatherDetails city={selectedCity} onClose={() => setSelectedCity(null)} />
          )}
        </Modal>
        {loading && (
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <LottieView
              source={require('../../assets/images/weather-storm-loading.json')}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <Text style={[styles.loadingText, { color: theme.text, marginTop: 16 }]}>Searching weather...</Text>
          </View>
        )}
        {errorMsg ? <Text style={[styles.errorMsg, { color: theme.error }]}>{errorMsg}</Text> : null}
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 32,
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 18,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: 10,
  },
  errorMsg: {
    color: '#ffb3b3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  weatherCard: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderRadius: 18,
    padding: 28,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cityName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
  },
  temp: {
    color: '#fff',
    fontSize: 54,
    fontWeight: '200',
    marginBottom: 2,
  },
  desc: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  feelsLike: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 2,
  },
  highLow: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'left',
    width: '100%',
  },
  hourlyScroll: {
    paddingVertical: 8,
  },
  hourlyCard: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    width: 100,
  },
  hourlyTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  hourlyIcon: {
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  modernWeatherCard: {
    width: '45%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50', // Default accent color
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sunTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  sunTimeCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sunTimeLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  sunTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 
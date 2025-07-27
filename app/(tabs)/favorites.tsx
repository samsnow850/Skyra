import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useUnit } from '../../context/UnitContext';
import { formatWindSpeed } from '../../utils/windSpeed';
import { supabase } from '../../utils/supabase';

const FAVORITES_KEY = 'FAVORITE_LOCATIONS';
const OPEN_WEATHER_API_KEY = '4862d5e067388e783d46e5265ed1c203';

export default function FavoritesScreen() {
  const { unit, windUnit } = useUnit();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});
  const [loadingWeather, setLoadingWeather] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();

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
    const sub = DeviceEventEmitter.addListener('favoritesUpdated', loadFavorites);
    return () => sub.remove();
  }, [user]);

  const loadFavorites = async () => {
    if (user) {
      // Load from Supabase if user is logged in
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('city_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
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
  };

  const removeFavorite = async (city: string) => {
    const newFavorites = favorites.filter(fav => fav !== city);
    await saveFavorites(newFavorites);
    if (expanded === city) setExpanded(null);
  };

  const toggleExpand = async (city: string) => {
    if (expanded === city) {
      setExpanded(null);
      return;
    }
    setExpanded(city);
    if (!weatherData[city]) {
      setLoadingWeather(city);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
        );
        const data = await response.json();
        setWeatherData(prev => ({ ...prev, [city]: data }));
      } catch {
        setWeatherData(prev => ({ ...prev, [city]: { error: 'Failed to fetch weather.' } }));
      }
      setLoadingWeather(null);
    }
  };

  const displayTempWithUnit = (tempC: number) => `${Math.round(tempC)}°C / ${Math.round(tempC * 9/5 + 32)}°F`;
  const displayTemp = (tempC: number) => Math.round(tempC);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.backgroundGradient as any} style={styles.gradient}>
        <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
        <FlatList
          data={favorites}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity
                style={[styles.favoriteItem, expanded === item && styles.selectedItem, { backgroundColor: theme.card }]}
                onPress={() => toggleExpand(item)}
              >
                <Text style={[styles.favoriteText, { color: theme.text }]}>{item}</Text>
                <TouchableOpacity onPress={() => removeFavorite(item)}>
                  <Ionicons name="trash" size={20} color={theme.error} />
                </TouchableOpacity>
              </TouchableOpacity>
              {expanded === item && (
                <View style={[styles.expandedContainer, { backgroundColor: theme.card }]}>
                  {loadingWeather === item ? (
                    <ActivityIndicator color={theme.text} style={{ marginVertical: 16 }} />
                  ) : weatherData[item] && !weatherData[item].error ? (
                    <>
                      <Text style={[styles.weatherTitle, { color: theme.text }]}>{weatherData[item].name}</Text>
                      <Ionicons
                        name={weatherData[item].weather[0].main === 'Clear' ? 'sunny' : weatherData[item].weather[0].main === 'Clouds' ? 'cloudy' : 'rainy'}
                        size={48}
                        color={theme.text}
                        style={{ marginBottom: 8 }}
                      />
                      <Text style={[styles.weatherTemp, { color: theme.text }]}>{displayTempWithUnit(weatherData[item].main.temp)}</Text>
                      <Text style={[styles.weatherDesc, { color: theme.text }]}>{weatherData[item].weather[0].description}</Text>
                      <Text style={[styles.weatherDetail, { color: theme.text }]}>Feels like: {displayTempWithUnit(weatherData[item].main.feels_like)}</Text>
                      <Text style={[styles.weatherDetail, { color: theme.text }]}>Humidity: {weatherData[item].main.humidity}%</Text>
                      <Text style={[styles.weatherDetail, { color: theme.text }]}>Pressure: {weatherData[item].main.pressure} hPa</Text>
                      <Text style={[styles.weatherDetail, { color: theme.text }]}>Wind: {formatWindSpeed(weatherData[item].wind.speed, windUnit)}</Text>
                    </>
                  ) : weatherData[item] && weatherData[item].error ? (
                    <Text style={[styles.errorText, { color: theme.error }]}>{weatherData[item].error}</Text>
                  ) : null}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.text }]}>No favorites yet. Add a city from the Search tab!</Text>}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, padding: 24 },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 32,
    letterSpacing: 1,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  selectedItem: {
    borderColor: '#FFD580',
    borderWidth: 2,
  },
  favoriteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  expandedContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    marginTop: -8,
  },
  weatherTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  weatherTemp: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 4,
  },
  weatherDesc: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  weatherDetail: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 2,
    opacity: 0.85,
  },
  errorText: {
    color: '#ffb3b3',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
  },
}); 